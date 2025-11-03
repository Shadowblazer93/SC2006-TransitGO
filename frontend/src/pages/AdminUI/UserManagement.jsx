import React, { useEffect, useState } from 'react'
import { supabase, user_loggedin, user_isadmin } from '../../supabaseClient'
import AdminFooterNav from '../../components/AdminFooterNav'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  user_isadmin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('users').select('*')
      if (error) throw error
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter((u) => {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const name = (u.username ?? '').toString().toLowerCase()
    const email = (u.email ?? '').toString().toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const admins = filtered.filter((u) => (u.user_type ?? '').toString().toLowerCase() === 'admin')
  const regulars = filtered.filter((u) => (u.user_type ?? '').toString().toLowerCase() === 'user')

  const openUser = (u) => setSelectedUser(u)
  const closeModal = () => setSelectedUser(null)

  const patchUser = async (uid, updates) => {
    setActionLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.from('users').update(updates).eq('uid', uid).select().single()
      if (error) throw error
      // update local list
      setUsers((cur) => cur.map((c) => (c.uid === uid ? data : c)))
      setSelectedUser(data)
    } catch (err) {
      setError(err?.message ?? String(err))
    } finally {
      setActionLoading(false)
    }
  }

  const formatValue = (v) => {
    if (v === null || v === undefined) return '—'
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
    if (typeof v === 'object') {
      // compact object rendering (limit depth/length)
      try {
        return JSON.stringify(v)
      } catch {
        return String(v)
      }
    }
    return String(v)
  }

  const renderAllFields = (obj) => {
    if (!obj) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(obj).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '6px 0',
              borderBottom: '1px solid #f3f3f3'
            }}
          >
            <div style={{ minWidth: 140, fontSize: 12, color: '#000', textTransform: 'capitalize', fontWeight: 500}}>{key}</div>
            <div style={{ flex: 1, fontSize: 13, color: '#444', whiteSpace: 'pre-wrap' }}>{formatValue(value)}</div>
          </div>
        ))}
      </div>
    )
  }

  const handleMakeAdmin = async (u) => {
    if (!u) return
    await patchUser(u.uid, { user_type: 'admin' })
  }

  const handleSuspend = async (u) => {
    if (!u) return
    // toggle suspended flag if present; otherwise set suspended=true
    const next = u.is_suspended ? false : true
    await patchUser(u.uid, { is_suspended: next })
  }

  const handleBan = async (u) => {
    if (!u) return
    const next = u.is_banned ? false : true
    await patchUser(u.uid, { is_banned: next })
  }

  const handleDelete = async (u) => {
    if (!u) return
    const ok = confirm(`Delete user ${u.email ?? u.username ?? u.uid}? This cannot be undone.`)
    if (!ok) return
    setActionLoading(true)
    setError(null)
    try {
      const { error } = await supabase.from('users').delete().eq('uid', u.uid)
      if (error) throw error
      setUsers((cur) => cur.filter((c) => c.uid !== u.uid))
      closeModal()
    } catch (err) {
      setError(err?.message ?? String(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading users...</div>
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>

  return (
    <div style={{ width: '100vw', padding: 12, paddingTop: 60, boxSizing: 'border-box', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#ddd', zIndex: 999 }}>
        <h1 style={{ fontSize: 18, margin: 0, color: '#000', fontWeight:600 }}>Manage Users</h1>
        <div style={{ width: 360, maxWidth: '60%' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name/email"
            style={{ width: '50vw', padding: '8px 10px', borderRadius: 8, border: '2px solid #888' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexDirection: 'column', marginTop: 8 }}>
        <section>
          <h2 style={{ margin: '0 0 8px 0' }}>Admins ({admins.length})</h2>
          {admins.length === 0 ? (
            <div style={{ padding: 12, color: '#666' }}>No admin users.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {admins.map((u) => (
                <div key={u.uid} onClick={() => openUser(u)} style={{ cursor: 'pointer', padding: 10, borderRadius: 8, background: '#aae4ffff', border: '1px solid #719faeff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#000' }}>{u.username ?? '—'}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{u.email ?? '—'}</div>
                  </div>
                  <div style={{ fontSize: 15, color: '#007aff', fontWeight: 700 }}>Admin</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ margin: '0 0 8px 0' }}>Users ({regulars.length})</h2>
          {regulars.length === 0 ? (
            <div style={{ padding: 12, color: '#666' }}>No users.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {regulars.map((u) => (
                <div key={u.uid} onClick={() => openUser(u)} style={{ cursor: 'pointer', padding: 10, borderRadius: 8, background: '#ffeecdff', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#000' }}>{u.username ?? '—'}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{u.email ?? '—'}</div>
                  </div>
                  <div style={{ fontSize: 15, color: '#444' }}>{u.user_type ?? 'user'}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 2000,
            padding: 16,
          }}
          onClick={closeModal}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 720, maxWidth: '100%', background: '#fff', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#444' }}>{selectedUser.username ?? selectedUser.name ?? 'User'}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{selectedUser.email ?? '—'}</div>
              </div>
              <div>
                <button onClick={closeModal} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#ddebffff', color: '#2969b4ff' }}>↩ Back</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#fafafa', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#666' }}>User ID</div>
                <div style={{ fontWeight: 700, color: '#444' }}>{selectedUser.uid}</div>
              </div>

              <div style={{ background: '#fafafa', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#666' }}>User Type</div>
                <div style={{ fontWeight: 700, color: '#444' }}>{selectedUser.user_type ?? 'user'}</div>
              </div>

              <div style={{ gridColumn: '1 / -1', background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>All Data</div>
                {renderAllFields(selectedUser)}
              </div>
            </div>

            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {/* Make admin (only for regular users) */}
              {((selectedUser.user_type ?? '').toString().toLowerCase() !== 'admin') && (
                <button
                  onClick={() => handleMakeAdmin(selectedUser)}
                  disabled={actionLoading}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #78b9ffff', background: '#add4ffff', color: '#0c3e58ff', fontWeight: 700 }}
                >
                  Make Admin
                </button>
              )}

              {/* Toggle suspend */}
              <button
                onClick={() => handleSuspend(selectedUser)}
                disabled={actionLoading}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd436ff', background: '#f4f0a8ff', color: '#9e5d0eff', fontWeight: 700 }}
              >
                {selectedUser.is_suspended ? 'Unsuspend' : 'Suspend'}
              </button>

              {/* Toggle ban */}
              <button
                onClick={() => handleBan(selectedUser)}
                disabled={actionLoading}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ff4d4f', background: '#ffb3b3ff', color: '#880c0eff', fontWeight: 700 }}
              >
                {selectedUser.is_banned ? 'Unban' : 'Ban'}
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(selectedUser)}
                disabled={actionLoading}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ff4d4f', background: '#ffacedff', color: '#6c1170ff', fontWeight: 700 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <AdminFooterNav />
    </div>
  )
}