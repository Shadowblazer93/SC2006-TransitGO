import React, { useEffect, useState } from 'react'
import { supabase, user_loggedin, user_isadmin } from '../../supabaseClient'
import AdminFooterNav from '../../components/AdminFooterNav'

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createMessage, setCreateMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // authentication
  const [perms, setPerms] = useState(true)
  user_loggedin().then((res) => {if (!res) setPerms(false)})
  user_isadmin().then((res) => {if (!res) setPerms(false)})
  if (!perms) {return (<div style={{background:'#ffaeaeff', fontWeight:600, fontSize:15, padding: '20px 5px'}}>YOU DO NOT HAVE PERMISSION TO VIEW THIS PAGE</div>)}

  async function getAuthorEmail() {
    const { data: { session } = {}, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) return 'Unknown'
    const email = session?.user?.email
    if (email) return email

    // fallback: try to fetch from users table (adjust PK column name if different)
    const uid = session?.user?.id
    if (!uid) return 'Unknown'
    const { data, error } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', uid)
      .maybeSingle()
    if (error || !data) return 'Unknown'
    return data.email ?? data.username ?? 'Unknown'
  }

  const fetchAnnouncements = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, message, created_time, author')
        .order('created_time', { ascending: false })
      if (error) throw error
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  const fmtTime = (t) => {
    if (!t) return 'Unknown'
    try {
      const d = new Date(t)
      return isNaN(d.getTime()) ? String(t) : d.toLocaleString()
    } catch {
      return String(t)
    }
  }

  const createAnnouncement = async () => {
    if (!createTitle.trim() || !createMessage.trim()) {
      setError('Title and message are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: createTitle.trim(),
        message: createMessage.trim(),
        author: await getAuthorEmail(),
        created_time: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('announcements').insert([payload]).select().single()
      if (error) throw error
      setAnnouncements((cur) => [data, ...cur])
      setCreateTitle('')
      setCreateMessage('')
      setShowCreate(false)
    } catch (err) {
      setError(err?.message ?? String(err))
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (a) => {
    setEditingId(a.id)
    setEditTitle(a.title || '')
    setEditMessage(a.message || '')
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditMessage('')
  }

  const updateAnnouncement = async (id) => {
    if (!editTitle.trim() || !editMessage.trim()) {
      setError('Title and message are required')
      return
    }
    setUpdating(true)
    setError(null)
    try {
      const updated = {
        title: editTitle.trim(),
        message: editMessage.trim(),
        author: await getAuthorEmail(),
        created_time: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('announcements').update(updated).eq('id', id).select().single()
      if (error) throw error
      setAnnouncements((cur) => cur.map((c) => (c.id === id ? data : c)))
      cancelEdit()
    } catch (err) {
      setError(err?.message ?? String(err))
    } finally {
      setUpdating(false)
    }
  }

  const deleteAnnouncement = async (id) => {
    const ok = confirm('Delete this announcement?')
    if (!ok) return
    setError(null)
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) throw error
      setAnnouncements((cur) => cur.filter((c) => c.id !== id))
    } catch (err) {
      setError(err?.message ?? String(err))
    }
  }

  return (
    <div style={{ width:'100vw', padding: 12, paddingTop: 90, fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial', boxSizing: 'border-box' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          background: '#eee',
          borderBottom: '3px solid #ddd',
          borderRadius: 20,
          zIndex: 999,
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ fontSize: 20, margin: 0, fontWeight: 600 }}>Manage Announcements</h1>
        <button
          onClick={() => {
            setShowCreate((s) => !s)
            setError(null)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: '#007aff',
            color: '#fff',
            fontWeight: 700,
            touchAction: 'manipulation',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          Create
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: '#b00020', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {showCreate && (
        <div style={{ marginTop: 0, marginBottom: 12, background: '#fff', border: '1px solid #eee', padding: 12, borderRadius: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              placeholder="Title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              style={{ width: '100vw-10', padding: 8, borderRadius: 8, border: '1px solid #ddd', background: '#eee', color: 'black' }}
            />
            <textarea
              placeholder="Message"
              value={createMessage}
              onChange={(e) => setCreateMessage(e.target.value)}
              rows={4}
              style={{ width: '100vw-10', padding: 8, borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', background: '#eee', color: 'black'}}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={createAnnouncement}
                disabled={saving}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#007aff', color: '#fff', fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                disabled={saving}
                style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '#ff6161ff', flex: 0.6 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div>No announcements.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map((a) => (
            <div key={a.id} style={{ background: '#d3ebffff', border: '1px solid #eee', borderRadius: 10, padding: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
              {editingId === a.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    style={{ background: '#fff', width: '100vw-10', padding: 8, borderRadius: 8, border: '1px solid #ddd', color: 'black'}}
                  />
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    rows={4}
                    style={{ background: '#fff', width: '100vw-10', padding: 8, borderRadius: 8, border: '1px solid #ddd', resize: 'vertical', color: 'black' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => updateAnnouncement(a.id)}
                      disabled={updating}
                      style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#007aff', color: '#fff', fontWeight: 700 }}
                    >
                      {updating ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={updating}
                      style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '  #ff6f6fff', flex: 0.6 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{a.title}</div>
                    <div style={{ marginTop: 6, whiteSpace: 'pre-wrap', color: '#111' }}>{a.message}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, color: '#666', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{a.author ?? 'Unknown'}</div>
                    <div>{fmtTime(a.created_time)}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => startEdit(a)}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #007aff', background: '#fff', color: '#007aff', fontWeight: 700 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ff4d4f', background: '#fff', color: '#ff4d4f', fontWeight: 700 }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <AdminFooterNav />
    </div>
  )
}