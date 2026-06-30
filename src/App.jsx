import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #F9F3F0;
    --sand: #EFE3DD;
    --bark: #8B6F4E;
    --soil: #3D2B1F;
    --moss: #4A6741;
    --rose: #B5737A;
    --rose-light: #F2DDE0;
    --rose-mid: #D4959B;
    --ink: #1C1611;
  }

  body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); }
  .app { min-height: 100vh; max-width: 420px; margin: 0 auto; background: var(--cream); position: relative; overflow: hidden; }

  .nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 420px;
    background: var(--soil);
    display: flex; justify-content: space-around; align-items: center;
    padding: 10px 0 10px; z-index: 100; border-radius: 24px 24px 0 0;
  }
  .nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer; opacity: 0.45; transition: opacity 0.2s;
    background: none; border: none; color: var(--cream);
  }
  .nav-item.active { opacity: 1; }
  .nav-item span { font-size: 9px; font-family: 'DM Sans', sans-serif; letter-spacing: 0.05em; text-transform: uppercase; }
  .nav-icon { font-size: 20px; }

  .header { padding: 52px 24px 16px; background: var(--cream); }
  .logo-wrap { display: flex; flex-direction: column; align-items: flex-start; }
  .logo-svg { height: 50px; width: auto; display: block; }

  .filters { display: flex; gap: 8px; padding: 0 24px 16px; overflow-x: auto; scrollbar-width: none; }
  .filters::-webkit-scrollbar { display: none; }
  .chip {
    padding: 6px 14px; border-radius: 100px; border: 1.5px solid var(--sand);
    background: transparent; cursor: pointer; font-size: 12px; color: var(--bark);
    white-space: nowrap; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s;
  }
  .chip.active { background: var(--soil); border-color: var(--soil); color: var(--cream); }

  .tag-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .tag-pill { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; letter-spacing: 0.03em; }

  .feed { padding: 0 24px 110px; display: flex; flex-direction: column; gap: 14px; }
  .card {
    background: white; border-radius: 20px; overflow: hidden; cursor: pointer;
    box-shadow: 0 2px 12px rgba(61,43,31,0.08); transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.4s ease both;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,43,31,0.14); }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-28px); clip-path: inset(0 0 0 100%); }
    to { opacity: 1; transform: translateX(0); clip-path: inset(0 0 0 0%); }
  }
  .card:nth-child(1) { animation-delay: 0.05s; }
  .card:nth-child(2) { animation-delay: 0.1s; }
  .card:nth-child(3) { animation-delay: 0.15s; }
  .card:nth-child(4) { animation-delay: 0.2s; }
  .card-accent { height: 5px; }
  .card-body { padding: 14px 16px 16px; }
  .card-format { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: var(--bark); margin-bottom: 8px; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 17px; line-height: 1.3; color: var(--soil); margin-bottom: 10px; }
  .card-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
  .meta-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--bark); }
  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px; border-top: 1px solid var(--sand); background: var(--cream);
  }
  .spots-badge { font-size: 12px; color: var(--bark); display: flex; align-items: center; gap: 5px; }
  .spots-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--moss); }
  .spots-dot.full { background: var(--rose); }
  .join-btn {
    padding: 7px 18px; border-radius: 100px; background: var(--soil); color: var(--cream);
    border: none; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; transition: background 0.2s;
  }
  .join-btn:hover { background: var(--rose); }
  .join-btn.joined { background: var(--moss); }

  .detail {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    width: 100%; height: 100%;
    z-index: 200; background: var(--cream);
    overflow-y: auto; animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100%); }
    to { transform: translateX(-50%) translateY(0); }
  }
  .detail-hero { height: 72px; position: relative; display: flex; align-items: center; padding: 16px 20px; }
  .detail-back {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.9); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    flex-shrink: 0;
  }
  .detail-content { padding: 22px; padding-bottom: 100px; }
  .detail-title { font-family: 'Playfair Display', serif; font-size: 24px; line-height: 1.25; color: var(--soil); margin-bottom: 10px; }
  .detail-desc { font-size: 14px; color: var(--bark); line-height: 1.6; margin-bottom: 20px; }
  .detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .info-box { background: white; border-radius: 14px; padding: 12px; }
  .info-box-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--bark); margin-bottom: 3px; }
  .info-box-value { font-size: 14px; font-weight: 500; color: var(--soil); }
  .section-title { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--soil); margin-bottom: 10px; }

  .motivation-box { background: var(--rose-light); border-radius: 14px; padding: 14px; margin-bottom: 20px; }
  .motivation-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--rose); margin-bottom: 6px; font-weight: 500; }
  .motivation-textarea {
    width: 100%; background: transparent; border: none; outline: none;
    font-size: 13px; color: var(--soil); font-family: 'DM Sans', sans-serif;
    line-height: 1.5; resize: none; min-height: 70px;
  }
  .motivation-textarea::placeholder { color: var(--bark); opacity: 0.7; }

  .big-join-btn {
    width: 100%; padding: 15px; border-radius: 16px; border: none; cursor: pointer;
    font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    background: var(--soil); color: var(--cream); transition: background 0.2s;
  }
  .big-join-btn:hover { background: var(--rose); }
  .big-join-btn.joined { background: var(--moss); }

  .create-page { padding: 52px 24px 110px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--soil); margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: var(--bark); margin-bottom: 24px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; color: var(--bark); margin-bottom: 6px; }
  .form-input, .form-textarea {
    width: 100%; padding: 12px 14px; background: white; border: 1.5px solid var(--sand);
    border-radius: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--soil);
    outline: none; transition: border-color 0.2s;
  }
  .form-input:focus, .form-textarea:focus { border-color: var(--soil); }
  .form-textarea { min-height: 80px; resize: vertical; }

  .format-picker { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .format-option {
    padding: 10px 8px; border-radius: 12px; border: 1.5px solid var(--sand);
    background: white; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    transition: all 0.2s; text-align: center; color: var(--bark);
  }
  .format-option .format-icon { font-size: 20px; }
  .format-option.selected { border-color: var(--soil); background: var(--soil); color: var(--cream); }

  .tag-input-wrap { position: relative; }
  .tag-input-wrap input { padding-right: 90px; }
  .tag-add-btn {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    padding: 5px 12px; border-radius: 100px; background: var(--soil); color: var(--cream);
    border: none; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif;
  }
  .tags-preview { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .tag-remove {
    padding: 4px 10px; border-radius: 100px; background: var(--rose-light); color: var(--rose);
    border: none; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 4px;
  }

  .submit-btn {
    width: 100%; padding: 15px; border-radius: 16px; border: none;
    background: var(--rose); color: white; cursor: pointer;
    font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    margin-top: 8px; transition: opacity 0.2s;
  }
  .submit-btn:hover { opacity: 0.85; }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .events-page { padding: 52px 24px 110px; }
  .events-hero {
    background: var(--soil); border-radius: 20px; padding: 24px;
    margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .events-hero-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--rose-mid); margin-bottom: 8px; }
  .events-hero-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--cream); line-height: 1.3; margin-bottom: 10px; }
  .events-hero-desc { font-size: 13px; color: #c4a898; line-height: 1.5; margin-bottom: 14px; }
  .events-hero-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .events-hero-meta span { font-size: 12px; color: #c4a898; }
  .events-cta {
    display: inline-block; padding: 10px 24px; border-radius: 100px;
    background: var(--rose); color: white; border: none; cursor: pointer;
    font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  }
  .events-program { background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px; }
  .program-title { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--soil); margin-bottom: 14px; }
  .program-item { display: flex; gap: 10px; margin-bottom: 14px; align-items: flex-start; }
  .program-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rose-light); border: 2px solid var(--rose); flex-shrink: 0; margin-top: 4px; }
  .program-time { font-size: 11px; font-weight: 500; color: var(--rose); min-width: 38px; padding-top: 1px; }
  .program-text { font-size: 13px; color: var(--soil); line-height: 1.4; }
  .winner-box { background: linear-gradient(135deg, var(--rose-light), var(--sand)); border-radius: 20px; padding: 18px; }
  .winner-title { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--soil); margin-bottom: 6px; }
  .winner-desc { font-size: 13px; color: var(--bark); line-height: 1.5; }

  .profile-page { padding: 52px 24px 110px; }
  .profile-header { text-align: center; margin-bottom: 24px; }
  .profile-avatar-big {
    width: 80px; height: 80px; border-radius: 50%; background: var(--sand);
    margin: 0 auto 10px; font-size: 38px; display: flex; align-items: center; justify-content: center;
  }
  .profile-name { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--soil); }
  .profile-bio { font-size: 13px; color: var(--bark); margin-top: 6px; line-height: 1.5; font-style: italic; }
  .my-events { display: flex; flex-direction: column; gap: 10px; }
  .mini-card {
    background: white; border-radius: 14px; padding: 12px 14px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 1px 6px rgba(61,43,31,0.06); cursor: pointer;
  }
  .mini-card-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .mini-card-title { font-size: 13px; color: var(--soil); font-weight: 500; }
  .mini-card-meta { font-size: 11px; color: var(--bark); margin-top: 2px; }

  .empty { text-align: center; padding: 50px 24px; color: var(--bark); }
  .empty-icon { font-size: 42px; margin-bottom: 10px; }
  .empty-text { font-size: 13px; line-height: 1.6; }

  .toast {
    position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
    color: white; padding: 11px 22px; border-radius: 100px;
    font-size: 13px; font-weight: 500; z-index: 300; animation: toastIn 0.3s ease; white-space: nowrap;
  }
  .toast.success { background: var(--moss); }
  .toast.error { background: var(--rose); }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

const tagColor = () => ({ bg: "rgba(181,115,122,0.15)", color: "#B5737A" });

const PARTICIPANTS = [];

const SUGGESTED_TAGS = [
  "cambiamento","lavoro","paura","identità","maternità","solitudine","ricominciare",
  "smarrimento","crescita","scuola","figli","decisione","ristrutturazione","casa",
  "lutto","elaborazione","matrimonio","separazione","problemi-di-coppia","gravidanza",
  "neonato","parto","post-parto","psicologo","nuovi-amici","empatia",
  "relazioni","carriera","freelance","università","trasloco","salute","amicizia",
];

const FORMATS = [
  { id: "standard", label: "Standard", icon: "👥", desc: "3–4 pers." },
  { id: "onetoone", label: "One to one", icon: "👥", desc: "2 pers." },
  { id: "gruppo", label: "Gruppo", icon: "👥", desc: "5 pers." },
];

const formatLabel = (id) => FORMATS.find(f => f.id === id);

function AffiniAppContent({ session }) {
  const [tab, setTab] = useState("home");
  const [events, setEvents] = useState([]); // topics reali da Supabase
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [detail, setDetail] = useState(null);
  const [joined, setJoined] = useState({});
  const [filter, setFilter] = useState("tutti");
  const [toast, setToast] = useState(null);
  const [motivation, setMotivation] = useState("");
  const [showMotivation, setShowMotivation] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return {year: d.getFullYear(), month: d.getMonth()}; });
  const [extraEvents, setExtraEvents] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [notifiedEvents, setNotifiedEvents] = useState({});
  const [editPhoto, setEditPhoto] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [availability, setAvailability] = useState({}); // { "2026-05-03": ["mattina","sera"], ... }
  // Other participants' availability (pre-filled for simulation)
  const otherAvailability = {
    7: [
      { name: "Marco B.", days: { "2026-03-28": ["Mattina 9–12","Pomeriggio 14–18"], "2026-04-05": ["Mattina 9–12"] } },
      { name: "Giulia R.", days: { "2026-03-28": ["Mattina 9–12"], "2026-04-12": ["Sera 18–21"] } },
    ]
  };
  const [confirmedDates, setConfirmedDates] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState({ name: "", bio: "", avatar: "🙋", photo: null });
  const [form, setForm] = useState({ title: "", desc: "", format: "", date: "", location: "", tagInput: "", tags: [], section: "" });
  const [participants, setParticipants] = useState([]);
  const [myTopics, setMyTopics] = useState({ upcoming: [], past: [] });

  const showToast = (msg, type="success") => { setToast({msg, type}); setTimeout(() => setToast(null), 2500); };

  // Carica il profilo utente
  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setProfileData({
          name: data.name || "",
          bio: data.bio || "",
          avatar: data.avatar_emoji || "🙋",
          photo: data.avatar_photo_url || null,
        });
      }
    };
    loadProfile();
  }, [session]);

  // Carica tutti i topic attivi (con i loro tag)
  const loadEvents = async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from("topics")
      .select(`
        id, title, description, format, max_participants, date, time_slot,
        city, venue, is_full, status, created_at, creator_id,
        topic_tags ( tags ( name ) )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore caricamento topic:", error);
      setEvents([]);
    } else {
      const mapped = (data || []).map(t => ({
        id: t.id,
        title: t.title,
        desc: t.description,
        tags: (t.topic_tags || []).map(tt => tt.tags?.name).filter(Boolean),
        date: t.date,
        time: t.time_slot,
        location: t.city,
        venue: t.venue,
        format: t.format,
        full: t.is_full,
        creator_id: t.creator_id,
        accentColor: "#B5737A",
        dateObj: t.date ? new Date(t.date) : null,
      }));
      setEvents(mapped);
    }
    setLoadingEvents(false);
  };

  useEffect(() => { loadEvents(); }, []);

  // Carica le mie iscrizioni
  useEffect(() => {
    const loadMySubscriptions = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("topic_id")
        .eq("user_id", session.user.id);
      if (data) {
        const joinedMap = {};
        data.forEach(s => { joinedMap[s.topic_id] = true; });
        setJoined(joinedMap);
      }
    };
    loadMySubscriptions();
  }, [session, events.length]);

  const handleJoin = async (id) => {
    const isCurrentlyJoined = joined[id];
    if (isCurrentlyJoined) {
      await supabase.from("subscriptions").delete().eq("topic_id", id).eq("user_id", session.user.id);
      setJoined(j => ({ ...j, [id]: false }));
      showToast("Iscrizione rimossa");
    } else {
      showToast("🎉 Sei iscritto all'incontro!");
      setJoined(j => ({ ...j, [id]: true }));
    }
  };

  const handleAddTag = () => {
    const t = form.tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || form.tags.includes(t) || form.tags.length >= 3) return;
    setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: "" }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.format || form.tags.length < 3) return showToast("Completa tutti i campi e aggiungi 3 tag", "error");

    const maxParticipants = form.format === "onetoone" ? 2 : form.format === "gruppo" ? 5 : 4;

    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .insert({
        creator_id: session.user.id,
        title: form.title,
        description: form.desc,
        format: form.format,
        max_participants: maxParticipants,
        date: form.date || null,
        city: form.location.split("—")[0].trim() || form.location,
        venue: form.location.includes("—") ? form.location.split("—")[1].trim() : null,
      })
      .select()
      .single();

    if (topicError || !topic) {
      showToast("Errore nella creazione del topic", "error");
      return;
    }

    // Crea/recupera i tag e collegali al topic
    for (const tagName of form.tags) {
      let { data: existingTag } = await supabase.from("tags").select("id").eq("name", tagName).single();
      let tagId = existingTag?.id;
      if (!tagId) {
        const { data: newTag } = await supabase.from("tags").insert({ name: tagName }).select().single();
        tagId = newTag?.id;
      }
      if (tagId) {
        await supabase.from("topic_tags").insert({ topic_id: topic.id, tag_id: tagId });
      }
    }

    // Il creatore è automaticamente iscritto
    await supabase.from("subscriptions").insert({
      topic_id: topic.id,
      user_id: session.user.id,
      role: "ci_sto_passando",
      motivation: "Ho creato questo topic.",
    });

    showToast("✨ Topic pubblicato!");
    setForm({ title: "", desc: "", format: "", date: "", location: "", tagInput: "", tags: [], section: "" });
    setTab("home");
    loadEvents();
  };

  const now = new Date();
  const activeEvents = events.filter(e => !e.dateObj || e.dateObj > now);
  const openDetail = async (id) => {
    setDetail(id);
    // Carica chi partecipa, solo se sono già iscritta
    if (joined[id]) {
      const { data } = await supabase
        .from("subscriptions")
        .select("user_id, role, motivation, profiles ( name, avatar_emoji, avatar_photo_url, bio )")
        .eq("topic_id", id);
      if (data) {
        setParticipants(data.map(p => ({
          id: p.user_id,
          name: p.profiles?.name || "Utente",
          avatar: p.profiles?.avatar_emoji || "🙋",
          photo: p.profiles?.avatar_photo_url || null,
          bio: p.motivation,
        })));
      }
    }
  };
  const filteredEvents = activeEvents
    .filter(e => filter === "tutti" || e.tags.includes(filter))
    .filter(e => !searchQuery || e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
  const ALL_TAGS = [...new Set(events.flatMap(e => e.tags))];

  return (
    <>
      <style>{style}</style>
      <div className="app">

        {/* DETAIL OVERLAY */}
        {detail && (() => {
          const ev = events.find(e => e.id === detail);
          const isJoined = joined[ev.id];
          const fmt = formatLabel(ev.format);
          return (
            <div className="detail">
              <div className="detail-hero" style={{ background: `linear-gradient(135deg, ${ev.accentColor}28, var(--sand))` }}>
                <button className="detail-back" onClick={() => { setDetail(null); setMotivation(""); setTimeout(() => window.scrollTo(0,0), 10); }}>←</button>
              </div>
              <div className="detail-content">
                <div className="tag-pills" style={{ marginBottom: 12 }}>
                  {ev.tags.map(tag => {
                    const c = tagColor(tag);
                    return <span key={tag} className="tag-pill" style={{ background: c.bg, color: c.color }}>#{tag}</span>;
                  })}
                </div>
                {confirmedDates[ev.id] && joined[ev.id] && (
                  <div style={{background:"#EBF5E9", border:"1.5px solid #4A6741", borderRadius:"12px", padding:"12px 14px", marginBottom:"16px", display:"flex", gap:"10px", alignItems:"flex-start"}}>
                    <span style={{fontSize:"18px"}}>🎉</span>
                    <div>
                      <div style={{fontSize:"13px", fontWeight:"600", color:"#2D4A28", marginBottom:"2px"}}>Data confermata!</div>
                      <div style={{fontSize:"12px", color:"#4A6741"}}>
                        📅 {confirmedDates[ev.id].date} · 🕐 {confirmedDates[ev.id].time} · 📍 {ev.location}
                      </div>

                    </div>
                  </div>
                )}
                {ev.date === null && !confirmedDates[ev.id] && joined[ev.id] && otherAvailability[ev.id] && (
                  <div style={{background:"var(--rose-light)", borderRadius:"12px", padding:"12px 14px", marginBottom:"16px"}}>
                    <div style={{fontSize:"12px", fontWeight:"600", color:"var(--rose)", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"0.06em"}}>Disponibilità ricevute</div>
                    {otherAvailability[ev.id].map((p,i) => (
                      <div key={i} style={{fontSize:"12px", color:"var(--soil)", marginBottom:"6px"}}>
                        <span style={{fontWeight:"500"}}>{p.name}</span>
                        <span style={{color:"var(--bark"}}> — {Object.keys(p.days).map(d => new Date(d).toLocaleDateString("it-IT",{day:"numeric",month:"short"})).join(", ")}</span>
                      </div>
                    ))}
                    <div style={{fontSize:"11px", color:"var(--bark)", marginTop:"8px", borderTop:"1px solid rgba(181,115,122,0.2)", paddingTop:"8px"}}>
                      ✓ Marco e Giulia sono entrambi disponibili il <strong>10 maggio mattina</strong> — in attesa della tua disponibilità per confermare.
                    </div>
                  </div>
                )}
                <h1 className="detail-title">{ev.title}</h1>
                <p className="detail-desc">{ev.desc}</p>
                <div className="detail-info-grid">
                  <div className="info-box">
                    <div className="info-box-label">📅 Data</div>
                    <div className="info-box-value" style={{color: (ev.date || confirmedDates[ev.id]) ? "var(--soil)" : "var(--rose)", fontSize: (ev.date || confirmedDates[ev.id]) ? "14px" : "12px"}}>
                      {ev.date || (confirmedDates[ev.id] ? confirmedDates[ev.id].date : "Da definire insieme")}
                    </div>
                  </div>
                  <div className="info-box">
                    <div className="info-box-label">🕐 Orario</div>
                    <div className="info-box-value" style={{color: (ev.time || confirmedDates[ev.id]) ? "var(--soil)" : "var(--rose)", fontSize: (ev.time || confirmedDates[ev.id]) ? "13px" : "12px"}}>
                      {ev.time || (confirmedDates[ev.id] ? confirmedDates[ev.id].time : "Da definire insieme")}
                    </div>
                  </div>
                  <div className="info-box" style={{gridColumn:"1/-1"}}>
                    <div className="info-box-label">📍 Luogo</div>
                    <div className="info-box-value" style={{marginBottom:"4px"}}>{ev.location} — {ev.venue}</div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((ev.venue || "") + " " + (ev.location || ""))}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{fontSize:"12px", color:"var(--rose)", fontWeight:"500", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"4px"}}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M6 8C6 8 2 11 6 11C10 11 6 8 6 8Z" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>
                      Apri in Google Maps
                    </a>
                  </div>
                  <div className="info-box"><div className="info-box-label">👥 Formato</div><div className="info-box-value">{fmt.label} <span style={{fontWeight:"400", fontSize:"12px", color:"var(--bark)"}}>({fmt.desc})</span></div></div>
                </div>
                {isJoined && (
                  <div style={{marginBottom:"20px"}}>
                    <div style={{fontSize:"13px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--bark)", marginBottom:"12px"}}>Chi partecipa</div>
                    <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                      {PARTICIPANTS.slice(0, 3).map(p => (
                        <div key={p.id} onClick={() => setViewingProfile(p)}
                          style={{display:"flex", alignItems:"center", gap:"12px", background:"white", borderRadius:"12px", padding:"12px 14px", cursor:"pointer"}}>
                          <div style={{width:"42px", height:"42px", borderRadius:"50%", background:"var(--sand)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", overflow:"hidden", flexShrink:0}}>
                            {p.photo ? <img src={p.photo} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : p.avatar}
                          </div>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:"14px", fontWeight:"500", color:"var(--soil)"}}>{p.name}</div>
                            <div style={{fontSize:"12px", color:"var(--bark)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.bio}</div>
                          </div>
                          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="var(--bark)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isJoined && (
                  ev.full
                    ? <div style={{padding:"16px", borderRadius:"14px", background:"var(--rose-light)", textAlign:"center", color:"var(--rose)", fontSize:"14px", fontWeight:"500"}}>
                        Posti esauriti — questo incontro è al completo
                      </div>
                    : <button className="big-join-btn" onClick={() => ev.date === null ? setShowAvailability(true) : setShowMotivation(true)}>
                        Voglio partecipare →
                      </button>
                )}
                {isJoined && (
                  <button className="big-join-btn joined"
                    onClick={() => { handleJoin(ev.id); setDetail(null); setTab("home"); }}>
                    ✓ Sei iscritto — annulla
                  </button>
                )}

                {showMotivation && (
                  <div style={{
                    position:"fixed", inset:0, zIndex:400,
                    background:"rgba(61,43,31,0.5)",
                    display:"flex", alignItems:"flex-end", justifyContent:"center"
                  }}>
                    <div style={{
                      background:"var(--cream)", width:"100%", maxWidth:"420px",
                      borderRadius:"20px 20px 0 0", padding:"24px 24px 40px"
                    }}>
                      <div style={{fontSize:"13px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--rose)", marginBottom:"14px"}}>
                        Da che posizione partecipi?
                      </div>
                      <div style={{display:"flex", flexDirection:"column", gap:"8px", marginBottom:"16px"}}>
                        {[
                          {id:"now", label:"🌱 Ci sto passando"},
                          {id:"past", label:"🤍 Ci sono passato"},
                        ].map(r => (
                          <button key={r.id}
                            onClick={() => setMotivation(r.label + " — ")}
                            style={{
                              padding:"11px 14px", borderRadius:"10px", border:"1.5px solid",
                              borderColor: motivation.startsWith(r.label) ? "var(--rose)" : "var(--sand)",
                              background: motivation.startsWith(r.label) ? "var(--rose-light)" : "white",
                              color:"var(--soil)", cursor:"pointer", fontSize:"13px", fontWeight:"500",
                              fontFamily:"DM Sans, sans-serif", textAlign:"left"
                            }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                      <div style={{fontSize:"13px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--rose)", marginBottom:"6px"}}>
                        Raccontaci brevemente
                      </div>
                      <textarea
                        style={{
                          width:"100%", padding:"12px 14px", borderRadius:"12px",
                          border:"1.5px solid var(--sand)", background:"white",
                          fontSize:"14px", fontFamily:"DM Sans, sans-serif", color:"var(--soil)",
                          outline:"none", resize:"none", minHeight:"80px"
                        }}
                        placeholder="Cosa ti lega a questo topic?
(questa nota sarà visibile solo agli altri partecipanti)"
                        value={motivation.includes(" — ") ? motivation.split(" — ")[1] : motivation}
                        onChange={e => {
                          const prefix = motivation.includes(" — ") ? motivation.split(" — ")[0] + " — " : "";
                          setMotivation(prefix + e.target.value);
                        }}
                      />
                      <div style={{display:"flex", gap:"10px", marginTop:"14px"}}>
                        <button onClick={() => { setShowMotivation(false); setMotivation(""); }}
                          style={{flex:1, padding:"13px", borderRadius:"12px", border:"1.5px solid var(--sand)", background:"white", color:"var(--bark)", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"14px"}}>
                          Annulla
                        </button>
                        <button onClick={async () => {
                          const role = motivation.split(" — ")[0];
                          const text = motivation.includes(" — ") ? motivation.split(" — ")[1] : "";
                          if (!role || !role.startsWith("🌱") && !role.startsWith("🤍")) return showToast("Scegli la tua posizione", "error");
                          if (!text.trim()) return showToast("Raccontaci cosa ti lega a questo topic", "error");
                          const roleValue = role.startsWith("🌱") ? "ci_sto_passando" : "ci_sono_passato";
                          await supabase.from("subscriptions").insert({
                            topic_id: ev.id,
                            user_id: session.user.id,
                            role: roleValue,
                            motivation: text.trim(),
                          });
                          setShowMotivation(false);
                          setJoined(j => ({ ...j, [ev.id]: true }));
                          showToast("🎉 Sei iscritto all'incontro!");
                          setMotivation("");
                          setDetail(null);
                          setTab("home");
                        }}
                          style={{flex:2, padding:"13px", borderRadius:"12px", border:"none", background:"var(--soil)", color:"var(--cream)", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"14px", fontWeight:"500"}}>
                          Confermo la mia partecipazione
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* HOME */}
        {tab === "home" && (
          <>
            <div className="header" style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <div className="logo-wrap" style={{display:"flex", flexDirection:"column"}}>
                <svg className="logo-svg" viewBox="0 0 178 50" xmlns="http://www.w3.org/2000/svg"
                  ref={svgEl => {
                    if (svgEl) {
                      const textEl = svgEl.querySelector("text");
                      if (textEl) {
                        try {
                          const bbox = textEl.getBBox();
                          svgEl.dataset.titleWidth = bbox.width;
                          svgEl.dataset.titleScale = svgEl.getBoundingClientRect().width / 178;
                        } catch(e) {}
                      }
                    }
                  }}>
                  <text y="44" fontFamily="Playfair Display, serif" fontSize="52" fontWeight="700" letterSpacing="-1">
                    <tspan fill="#3D2B1F" dx="0">A</tspan>
                    <tspan fill="#3D2B1F" dx="-2">F</tspan>
                    <tspan fill="#B5737A" dx="-2">F</tspan>
                    <tspan fill="#3D2B1F" dx="-2">I</tspan>
                    <tspan fill="#3D2B1F" dx="-3">N</tspan>
                    <tspan fill="#3D2B1F" dx="-3">I</tspan>
                  </text>
                </svg>
                <div style={{
                  overflow:"hidden", marginTop:"0px"
                }}>
                  <div style={{
                    fontFamily:"DM Sans, sans-serif", fontSize:"13px", fontWeight:400,
                    color:"#8B6F4E", textTransform:"uppercase",
                    whiteSpace:"nowrap", display:"inline-block",
                    transformOrigin:"left top"
                  }} ref={el => {
                    if (el) {
                      requestAnimationFrame(() => {
                        const svgEl = el.closest(".logo-wrap").querySelector("svg");
                        const textEl = svgEl && svgEl.querySelector("text");
                        if (textEl) {
                          try {
                            const bbox = textEl.getBBox();
                            const svgRect = svgEl.getBoundingClientRect();
                            const renderedTitleWidth = (bbox.width / 178) * svgRect.width;
                            const naturalWidth = el.scrollWidth;
                            if (naturalWidth > 0 && renderedTitleWidth > 0) {
                              el.style.transform = `scaleX(${renderedTitleWidth / naturalWidth})`;
                              el.parentElement.style.width = renderedTitleWidth + "px";
                            }
                          } catch(e) {}
                        }
                      });
                    }
                  }}>
                    PER OGNI FASE DI VITA
                  </div>
                </div>
              </div>
              <button onClick={() => setShowGuide(true)}
                style={{background:"var(--soil)", border:"none", borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginTop:"8px", flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <path d="M7 6.5V10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="7" cy="4.5" r="0.9" fill="white"/>
                </svg>
              </button>
            </div>

            <div className="filters">
              <button className="chip" onClick={() => setSearchOpen(true)} style={{padding:"6px 10px", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6.5" cy="6.5" r="5" stroke="#3D2B1F" strokeWidth="1.5"/>
                  <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#3D2B1F" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <button className={`chip ${filter === "tutti" ? "active" : ""}`} onClick={() => setFilter("tutti")}>Tutti</button>
              {ALL_TAGS.map(tag => (
                <button key={tag} className={`chip ${filter === tag ? "active" : ""}`} onClick={() => setFilter(tag)}>#{tag}</button>
              ))}
            </div>
            {searchOpen && (
              <div style={{
                position:"fixed", inset:0, zIndex:300,
                background:"rgba(61,43,31,0.4)",
                display:"flex", flexDirection:"column",
              }} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
                <div style={{
                  background:"var(--cream)", padding:"16px 20px 20px",
                  borderRadius:"0 0 20px 20px",
                  boxShadow:"0 4px 24px rgba(61,43,31,0.15)"
                }} onClick={e => e.stopPropagation()}>
                  <div style={{display:"flex", alignItems:"center", gap:"10px",
                    background:"white", borderRadius:"12px", border:"1.5px solid var(--sand)",
                    padding:"10px 14px"}}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
                      <circle cx="6.5" cy="6.5" r="5" stroke="#8B6F4E" strokeWidth="1.5"/>
                      <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#8B6F4E" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                      autoFocus
                      style={{flex:1, border:"none", outline:"none", fontSize:"15px",
                        fontFamily:"DM Sans, sans-serif", color:"var(--soil)", background:"transparent"}}
                      placeholder="Cerca un tag... es. cambiamento"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")}
                        style={{border:"none", background:"none", cursor:"pointer", fontSize:"16px", color:"var(--bark)"}}>✕</button>
                    )}
                  </div>
                  {searchQuery && (() => {
                    const matched = [...new Set(activeEvents.flatMap(e => e.tags).filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())))];
                    return matched.length > 0 ? (
                      <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"12px"}}>
                        {matched.map(tag => (
                          <button key={tag} onClick={() => { setFilter(tag); setSearchOpen(false); setSearchQuery(""); }}
                            style={{padding:"5px 12px", borderRadius:"100px", background:"var(--rose-light)",
                              color:"var(--rose)", border:"none", cursor:"pointer", fontSize:"13px",
                              fontFamily:"DM Sans, sans-serif", fontWeight:"500"}}>
                            #{tag}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{marginTop:"12px", fontSize:"13px", color:"var(--bark)"}}>Nessun tag trovato</div>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className="feed">
              {loadingEvents && (
                <div className="empty"><div className="empty-icon">⏳</div><div className="empty-text">Carico i topic...</div></div>
              )}
              {!loadingEvents && filteredEvents.length === 0 && (
                <div className="empty"><div className="empty-icon">🌿</div><div className="empty-text">Nessun topic ancora.<br />Sii la prima a crearne uno!</div></div>
              )}
              {filteredEvents.map(ev => {
                const isJoined = joined[ev.id];
                const fmt = formatLabel(ev.format);
                return (
                  <div key={ev.id} className="card" onClick={() => openDetail(ev.id)}>
                
                    <div className="card-body">
                      <div className="card-format">{fmt.icon} {fmt.label}</div>
                      <h2 className="card-title">{ev.title}</h2>
                      <div className="tag-pills">
                        {ev.tags.map(tag => {
                          const c = tagColor(tag);
                          return <span key={tag} className="tag-pill" style={{ background: c.bg, color: c.color }}>#{tag}</span>;
                        })}
                      </div>
                      <div className="card-meta">
                        {ev.date
                          ? <><span className="meta-item">📅 {ev.date}</span><span className="meta-item">🕐 {ev.time}</span></>
                          : <span className="meta-item" style={{color:"var(--rose)", fontStyle:"italic"}}>📅 Data da definire insieme</span>
                        }
                        <span className="meta-item">📍 {ev.location}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="spots-badge">
                        <div className={`spots-dot ${ev.full ? "full" : ""}`} />
                        <span style={{color: ev.full ? "var(--rose)" : "var(--bark)", fontWeight: ev.full ? "500" : "400"}}>
                          {ev.full ? "Posti esauriti" : "Posti disponibili"}
                        </span>
                      </div>
                      {ev.full && !isJoined
                        ? <span style={{padding:"7px 18px", borderRadius:"100px", background:"var(--rose-light)", color:"var(--rose)", fontSize:"13px", fontWeight:"500"}}>Completo</span>
                        : <button className={`join-btn ${isJoined ? "joined" : ""}`}
                            onClick={e => { e.stopPropagation(); openDetail(ev.id); }}>
                            {isJoined ? "✓ Iscritto" : "Partecipo"}
                          </button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CREATE */}
        {tab === "create" && (
          <div className="create-page">
            <h1 className="page-title">Crea un topic</h1>
            <p className="page-sub">Hai bisogno di parlare?<br/>Trova persone che possono capirti.</p>

            <div className="form-group">
              <label className="form-label">Titolo</label>
              <textarea className="form-textarea" placeholder="Es. Sto pensando di lasciare il lavoro e dedicarmi al mio progetto"
                maxLength={120} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div style={{fontSize:"11px", color:"var(--bark)", textAlign:"right", marginTop:"4px"}}>{form.title.length}/120</div>
            </div>
            <div className="form-group">
              <label className="form-label">Raccontaci di più</label>
              <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="Es. Non mi rispecchio più nel lavoro per cui ho studiato tanto. Vorrei pensare al mio progetto e mettermi in proprio ma ho paura di buttare all'aria un'intera carriera senza avere certezze di come andrà il futuro."
                maxLength={300} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              <div style={{fontSize:"11px", color:"var(--bark)", textAlign:"right", marginTop:"4px"}}>{form.desc.length}/300</div>
            </div>
            <div className="form-group">
              <label className="form-label">Formato incontro</label>
              <div className="format-picker">
                {FORMATS.map(f => (
                  <button key={f.id} className={`format-option ${form.format === f.id ? "selected" : ""}`}
                    onClick={() => setForm(fm => ({ ...fm, format: f.id }))}>
                    <span className="format-icon">{f.icon}</span>
                    <span>{f.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">3 Tag obbligatori ({form.tags.length}/3)</label>
              {form.tags.length < 3 && (
                <div className="tag-input-wrap">
                  <input className="form-input" placeholder="Es. identità, cambiamento..."
                    value={form.tagInput}
                    onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleAddTag()} />
                  <button className="tag-add-btn" onClick={handleAddTag}>+ Aggiungi</button>
                </div>
              )}
              {form.tags.length < 3 && (() => {
                // Extract meaningful words from title and desc
                const stopwords = ["il","lo","la","i","gli","le","un","una","uno","di","a","da","in","con","su","per","tra","fra","che","non","ho","mi","si","ci","è","e","ma","o","se","al","del","dei","della","delle","degli","nel","nei","nella","nelle","questo","questa","questi","queste","mio","mia","miei","mie","suo","sua","più","come","anche","dopo","prima","tutto","tutti","tutta","tutte","sono","essere","fare","mettere","avere","volere","potere","stare","andare","quello","quella","senza","ancora","già","loro","vero","modo","cosa","però","quando","dove","perché","qui","lì","via","via"];
                const textWords = (form.title + " " + form.desc)
                  .toLowerCase()
                  .replace(/[^a-zàèéìòù\s]/g, " ")
                  .split(/\s+/)
                  .filter(w => w.length > 3 && !stopwords.includes(w));
                const textMatches = [...new Set(textWords)]
                  .filter(w => !form.tags.includes(w) && (form.tagInput === "" || w.includes(form.tagInput.toLowerCase())))
                  .slice(0, 4);
                const listMatches = form.tagInput.length > 0
                  ? SUGGESTED_TAGS.filter(t => t.toLowerCase().includes(form.tagInput.toLowerCase()) && !form.tags.includes(t) && !textMatches.includes(t)).slice(0, 4)
                  : SUGGESTED_TAGS.filter(t => !form.tags.includes(t)).slice(0, 2);
                const allSuggestions = [...new Set([...textMatches, ...listMatches])].slice(0, 6);
                return allSuggestions.length > 0 ? (
                  <div style={{marginTop:"8px"}}>
                    {(form.title || form.desc) && (
                      <div style={{fontSize:"11px", color:"var(--bark)", marginBottom:"6px"}}>Suggeriti:</div>
                    )}
                    <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                      {allSuggestions.map(t => (
                        <button key={t} onClick={() => {
                          if (form.tags.length < 3) setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: "" }));
                        }}
                          style={{padding:"4px 12px", borderRadius:"100px",
                            background: "var(--rose-light)",
                            color: "var(--rose)",
                            border:"none", cursor:"pointer",
                            fontSize:"12px", fontFamily:"DM Sans, sans-serif"}}>
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              {form.tags.length > 0 && (
                <div style={{display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"8px"}}>
                  {form.tags.map(tag => (
                    <button key={tag} onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}
                      style={{padding:"5px 12px", borderRadius:"100px", background:"var(--soil)",
                        color:"var(--cream)", border:"none", cursor:"pointer",
                        fontSize:"12px", fontFamily:"DM Sans, sans-serif", fontWeight:"600"}}>
                      #{tag} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Data (entro 30 giorni)</label>
                {(() => {
                  const today = new Date();
                  const maxDate = new Date(today);
                  maxDate.setDate(today.getDate() + 30);
                  const year = calMonth.year;
                  const month = calMonth.month;
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const offset = firstDay === 0 ? 6 : firstDay - 1;
                  const monthName = new Date(year, month, 1).toLocaleDateString("it-IT", {month:"long", year:"numeric"});
                  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
                  const canGoNext = new Date(year, month, 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                  const selectedDate = form.date ? new Date(form.date) : null;
                  const allCells = [];
                  for (let i = 0; i < offset; i++) allCells.push({day: null});
                  for (let d = 1; d <= daysInMonth; d++) {
                    const date = new Date(year, month, d);
                    allCells.push({day: d, date, month: "current"});
                  }
                  let nextDay = 1;
                  while (allCells.length % 7 !== 0) {
                    const date = new Date(year, month + 1, nextDay);
                    allCells.push({day: nextDay++, date, month: "next"});
                  }
                  return (
                    <div style={{background:"white", borderRadius:"12px", border:"1.5px solid var(--sand)", padding:"14px"}}>
                      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px"}}>
                        <button onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month - 1); return {year: d.getFullYear(), month: d.getMonth()}; })}
                          disabled={!canGoPrev}
                          style={{background:"none", border:"none", cursor: canGoPrev ? "pointer" : "default", color: canGoPrev ? "var(--soil)" : "transparent", fontSize:"16px", padding:"0 6px"}}>‹</button>
                        <div style={{fontSize:"13px", fontWeight:"600", color:"var(--soil)", textTransform:"capitalize"}}>{monthName}</div>
                        <button onClick={() => setCalMonth(m => { const d = new Date(m.year, m.month + 1); return {year: d.getFullYear(), month: d.getMonth()}; })}
                          disabled={!canGoNext}
                          style={{background:"none", border:"none", cursor: canGoNext ? "pointer" : "default", color: canGoNext ? "var(--soil)" : "transparent", fontSize:"16px", padding:"0 6px"}}>›</button>
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginBottom:"6px"}}>
                        {["L","M","M","G","V","S","D"].map((d,i) => (
                          <div key={i} style={{textAlign:"center", fontSize:"10px", color:"var(--bark)", fontWeight:"500"}}>{d}</div>
                        ))}
                      </div>
                      <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px"}}>
                        {allCells.map((cell, i) => {
                          if (!cell.day) return <div key={i}/>;
                          const isPast = cell.date < today && cell.date.toDateString() !== today.toDateString();
                          const isOutOfRange = cell.date > maxDate;
                          const isDisabled = isPast || isOutOfRange || cell.month === "next";
                          const isSelected = selectedDate && cell.date.toDateString() === selectedDate.toDateString();
                          const isToday = cell.date.toDateString() === today.toDateString();
                          return (
                            <button key={i}
                              disabled={isDisabled}
                              onClick={() => {
                                const d = cell.date;
                                setForm(f => ({...f, date: d.toISOString().split("T")[0]}));
                              }}
                              style={{
                                padding:"6px 2px", borderRadius:"8px", border:"none",
                                fontSize:"13px", fontFamily:"DM Sans, sans-serif",
                                cursor: isDisabled ? "default" : "pointer",
                                background: isSelected ? "var(--soil)" : isToday ? "var(--sand)" : "transparent",
                                color: isSelected ? "var(--cream)" : isDisabled ? "rgba(139,111,78,0.25)" : "var(--soil)",
                                fontWeight: isSelected ? "600" : "400",
                                opacity: cell.month === "next" ? 0 : 1,
                              }}>
                              {cell.day}
                            </button>
                          );
                        })}
                      </div>
                      {form.date && (
                        <div style={{textAlign:"center", marginTop:"10px", fontSize:"12px", color:"var(--rose)", fontWeight:"500"}}>
                          📅 {new Date(form.date).toLocaleDateString("it-IT", {weekday:"long", day:"numeric", month:"long"})}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="form-group">
                <label className="form-label">Luogo</label>
                <input className="form-input" placeholder="Es. Modena — Baracchina, Via Emilia 12"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <button className="submit-btn" onClick={handleCreate}
              disabled={!form.title || !form.format || form.tags.length < 3}>
              Pubblica topic ✨
            </button>
          </div>
        )}

        {/* EVENTI */}
        {tab === "events" && (
          <div className="events-page">
            <div style={{marginBottom:"20px"}}>
              <h1 style={{fontFamily:"Playfair Display, serif", fontSize:"26px", color:"var(--soil)", marginBottom:"8px"}}>Eventi</h1>
              <p style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6"}}>
                Ogni mese AFFINI organizza un evento dal vivo dedicato al topic più discusso.<br/>Una vera e propria esperienza per coinvolgere e ispirare.
              </p>
            </div>
          <div className="events-hero">
              <div className="events-hero-label">Evento del mese — Aprile 2025</div>
              <div className="events-hero-title">Cambiare lavoro: dal dubbio all'azione</div>
              <div className="events-hero-desc">Una mattina per muovere il corpo, ascoltare chi l'ha fatto davvero e capire cosa vuoi tu.</div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px"}}>
                <span style={{fontSize:"12px", color:"#c4a898"}}>📅 Sab 12 Apr</span>
                <span style={{fontSize:"12px", color:"#c4a898"}}>🕐 9:00–12:30</span>
                <span style={{fontSize:"12px", color:"#c4a898"}}>📍 Milano</span>
              </div>
              <div style={{display:"flex", gap:"16px", marginBottom:"18px"}}>
                <span style={{fontSize:"12px", color:"#c4a898"}}>👥 Max 25 persone</span>
                <span style={{fontSize:"12px", color:"#c4a898"}}>🎟 45€</span>
              </div>
              <button className="events-cta">Prenota il tuo posto →</button>
            </div>
            <div className="events-program">
              <div className="program-title">Il programma</div>
              {[
                { time: "8:30", text: "Pilates 1 ora — muovi il corpo, goditi la mattina" },
                { time: "9:30", text: "Colazione e chiacchiere libere — 45 min di connessione informale" },
                { time: "10:15", text: "Ospite 1,5 ore — chi ha lasciato il lavoro fisso e racconta com'è andata davvero" },
                { time: "11:45", text: "Workshop Vision Board — 1 ora per capire cosa vuoi e come arrivarci" },
              ].map((item, i) => (
                <div key={i} className="program-item">
                  <div className="program-dot" />
                  <div className="program-time">{item.time}</div>
                  <div className="program-text">{item.text}</div>
                </div>
              ))}
            </div>
            <div className="winner-box">
              <div className="winner-title">🏆 Premio community del mese</div>
              <div className="winner-desc">Chi ha creato il topic più partecipato e riprodotto vince l'ingresso gratuito all'evento + 1 ospite a scelta. I risultati escono il 1° di ogni mese.</div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <div className="profile-page">
            <div className="profile-header">
              <div style={{position:"relative", width:"80px", margin:"0 auto 12px", cursor:"pointer"}} onClick={() => setEditPhoto(true)}>
                <div className="profile-avatar-big" style={{overflow:"hidden", padding: profileData.photo ? 0 : undefined}}>
                  {profileData.photo
                    ? <img src={profileData.photo} alt="profilo" style={{width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%"}} />
                    : profileData.avatar}
                </div>
                <div style={{position:"absolute", bottom:0, right:0, width:"22px", height:"22px", borderRadius:"50%", background:"var(--soil)", border:"2px solid var(--cream)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 7.5L2.5 9L9 2.5L7.5 1L1 7.5Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
                    <path d="M6 2L8 4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              {editPhoto && (
                <div style={{position:"fixed", inset:0, zIndex:400, background:"rgba(61,43,31,0.4)", display:"flex", alignItems:"flex-end", justifyContent:"center"}}
                  onClick={() => setEditPhoto(false)}>
                  <div style={{background:"var(--cream)", width:"100%", maxWidth:"420px", borderRadius:"20px 20px 0 0", padding:"24px 24px 40px", maxHeight:"80vh", overflowY:"auto"}}
                    onClick={e => e.stopPropagation()}>
                    <div style={{fontSize:"16px", fontFamily:"Playfair Display, serif", color:"var(--soil)", marginBottom:"16px", fontWeight:"700"}}>Foto profilo</div>

                    <div style={{textAlign:"center", marginBottom:"16px"}}>
                      <div style={{width:"70px", height:"70px", borderRadius:"50%", background:"var(--sand)", margin:"0 auto 10px", fontSize:"34px", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden"}}>
                        {profileData.photo ? <img src={profileData.photo} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : profileData.avatar}
                      </div>
                      <label style={{display:"inline-block", padding:"7px 18px", borderRadius:"100px", background:"var(--soil)", color:"var(--cream)", fontSize:"13px", fontFamily:"DM Sans, sans-serif", fontWeight:"500", cursor:"pointer"}}>
                        Carica dal rullino
                        <input type="file" accept="image/*" style={{display:"none"}}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = ev => { setProfileData(p => ({...p, photo: ev.target.result})); setEditPhoto(false); };
                            reader.readAsDataURL(file);
                          }} />
                      </label>
                      {profileData.photo && (
                        <button onClick={() => setProfileData(p => ({...p, photo: null}))}
                          style={{display:"block", margin:"8px auto 0", fontSize:"12px", color:"var(--bark)", background:"none", border:"none", cursor:"pointer", fontFamily:"DM Sans, sans-serif"}}>
                          Rimuovi foto
                        </button>
                      )}
                    </div>

                    <div style={{fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--bark)", marginBottom:"10px", fontWeight:"500"}}>Oppure scegli un'emoji</div>
                    {[
                      { label: "Persone", emojis: ["👩","👩🏻","👩🏼","👩🏽","👩🏾","👩🏿","👨","👨🏻","👨🏼","👨🏽","👨🏾","👨🏿","🧕","🧕🏻","🧕🏽","🧕🏿","🧔","🧔🏻","🧔🏽","🧔🏿","🙋🏻‍♀️","🙋🏽‍♀️","🙋🏻‍♂️","🙋🏽‍♂️"] },
                      { label: "Animali", emojis: ["🦋","🐺","🦊","🐻","🐼","🦁","🐯","🐨","🦔","🦦","🐸","🦜","🦢","🐬","🐝","🐙"] },
                      { label: "Natura", emojis: ["☀️","🌙","⭐️","🌈","🌍","🌦️","🌊","🌸","🌻","🍀","🍂","❄️","🌋","🏝️","🔥","💧"] },
                      { label: "Colori", emojis: ["💛","❤️","💚","💙","🩷","💜","🖤","🤍","🟡","🔴","🟢","🔵","🟠","🟣","⚫️","⬜️"] },
                      { label: "Altro", emojis: ["🕒","💋","👀","🧠","🧶","👑","🐚","🍄","💥","☔️","🍇","🍓","🍎","🥥","🥑","🥐","🍕","🍷","☕️","🫖","⏳","📸","💎","🕯️","🔑","🛎️","🧸","🎈","🪭","📓","📎","🔒"] },
                    ].map(group => (
                      <div key={group.label} style={{marginBottom:"12px"}}>
                        <div style={{fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--bark)", marginBottom:"6px", fontWeight:"500"}}>{group.label}</div>
                        <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                          {group.emojis.map(e => (
                            <button key={e} onClick={() => { setProfileData(p => ({...p, avatar: e, photo: null})); setEditPhoto(false); }}
                              style={{fontSize:"22px", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center",
                                background: profileData.avatar === e && !profileData.photo ? "var(--rose-light)" : "transparent",
                                border: profileData.avatar === e && !profileData.photo ? "1.5px solid var(--rose)" : "1.5px solid transparent",
                                borderRadius:"8px", cursor:"pointer"}}>
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="profile-name">{profileData.name}</div>
              <div className="profile-bio">"{profileData.bio}"</div>
              <button onClick={() => setEditProfile(true)} style={{marginTop:"10px", padding:"6px 16px", borderRadius:"100px", border:"1.5px solid var(--sand)", background:"transparent", color:"var(--bark)", fontSize:"12px", fontFamily:"DM Sans, sans-serif", cursor:"pointer"}}>
                Modifica profilo
              </button>
              <button onClick={() => supabase.auth.signOut()} style={{marginTop:"10px", marginLeft:"8px", padding:"6px 16px", borderRadius:"100px", border:"1.5px solid var(--sand)", background:"transparent", color:"var(--rose)", fontSize:"12px", fontFamily:"DM Sans, sans-serif", cursor:"pointer"}}>
                Esci
              </button>

              {editProfile && (
                <div style={{position:"fixed", inset:0, zIndex:400, background:"var(--cream)", overflowY:"auto", padding:"52px 24px 40px"}}>
                  <div style={{fontSize:"16px", fontFamily:"Playfair Display, serif", color:"var(--soil)", marginBottom:"20px", fontWeight:"700"}}>Modifica profilo</div>



                    <div style={{marginBottom:"14px"}}>
                      <div style={{fontSize:"11px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--bark)", marginBottom:"6px"}}>Nome</div>
                      <input style={{width:"100%", padding:"11px 14px", borderRadius:"12px", border:"1.5px solid var(--sand)", background:"white", fontSize:"14px", fontFamily:"DM Sans, sans-serif", color:"var(--soil)", outline:"none"}}
                        value={profileData.name}
                        onChange={e => setProfileData(p => ({...p, name: e.target.value}))} />
                    </div>

                    <div style={{marginBottom:"20px"}}>
                      <div style={{fontSize:"11px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--bark)", marginBottom:"6px"}}>Descrizione</div>
                      <textarea style={{width:"100%", padding:"11px 14px", borderRadius:"12px", border:"1.5px solid var(--sand)", background:"white", fontSize:"14px", fontFamily:"DM Sans, sans-serif", color:"var(--soil)", outline:"none", resize:"none", minHeight:"220px"}}
                        maxLength={600}
                        value={profileData.bio}
                        onChange={e => setProfileData(p => ({...p, bio: e.target.value}))} />
                      <div style={{fontSize:"11px", color:"var(--bark)", textAlign:"right", marginTop:"4px"}}>{profileData.bio.length}/600</div>
                    </div>

                  <div style={{display:"flex", gap:"10px"}}>
                    <button onClick={() => setEditProfile(false)}
                      style={{flex:1, padding:"13px", borderRadius:"12px", border:"1.5px solid var(--sand)", background:"white", color:"var(--bark)", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"14px"}}>
                      Annulla
                    </button>
                    <button onClick={async () => {
                      await supabase.from("profiles").update({
                        name: profileData.name,
                        bio: profileData.bio,
                        avatar_emoji: profileData.avatar,
                        avatar_photo_url: profileData.photo,
                      }).eq("id", session.user.id);
                      setEditProfile(false);
                      showToast("Profilo aggiornato!");
                    }}
                      style={{flex:2, padding:"13px", borderRadius:"12px", border:"none", background:"var(--soil)", color:"var(--cream)", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"14px", fontWeight:"500"}}>
                      Salva
                    </button>
                  </div>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div style={{marginBottom:"24px"}}>
                {notifications.map((n, i) => (
                  <div key={i} style={{background:"#FFF0F0", border:"2px solid #D63030", borderRadius:"14px", padding:"16px 18px", marginBottom:"10px", display:"flex", gap:"12px", alignItems:"flex-start"}}>
                    <span style={{fontSize:"22px"}}>📅</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"14px", fontWeight:"700", color:"#D63030", marginBottom:"4px"}}>Data confermata!</div>
                      <div style={{fontSize:"13px", color:"var(--soil)", lineHeight:"1.4", fontWeight:"500"}}>"{n.title}"</div>
                      <div style={{fontSize:"12px", color:"var(--bark)", marginTop:"5px"}}>📅 {n.date} · 🕐 {n.time}</div>

                    </div>
                    <button onClick={() => setNotifications(ns => ns.filter((_,j) => j !== i))}
                      style={{background:"none", border:"none", cursor:"pointer", color:"var(--bark)", fontSize:"18px", padding:"0"}}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {(() => {
              const myIds = Object.keys(joined).filter(k => joined[k]).map(Number);
              const myEvents = events.filter(e => myIds.includes(e.id));
              const upcoming = myEvents.filter(e => !e.dateObj || e.dateObj > new Date());
              const past = myEvents.filter(e => e.dateObj && e.dateObj <= new Date());
              return <>
                <h2 className="section-title">Prossimi incontri</h2>
                <div className="my-events" style={{marginBottom: 24}}>
                  {upcoming.length === 0 && (
                    <div className="empty" style={{padding:"20px 0"}}>
                      <div className="empty-icon">🌱</div>
                      <div className="empty-text">Nessun incontro in programma.<br />Esplora il feed!</div>
                    </div>
                  )}
                  {upcoming.map(ev => (
                    <div key={ev.id} className="mini-card" onClick={() => { setTab("home"); setDetail(ev.id); }}>
                      <div className="mini-card-dot" style={{background: ev.accentColor}} />
                      <div>
                        <div className="mini-card-title">{ev.title}</div>
                        <div className="mini-card-meta">
                        {ev.date
                          ? `📅 ${ev.date}${ev.time ? " · 🕐 " + ev.time : ""} · 📍 ${ev.location}`
                          : confirmedDates[ev.id]
                            ? `📅 ${confirmedDates[ev.id].date} · 🕐 ${confirmedDates[ev.id].time} · 📍 ${ev.location}`
                            : `📅 Data da definire · 📍 ${ev.location}`}
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
                {past.length > 0 && <>
                  <h2 className="section-title">Storico</h2>
                  <div className="my-events">
                    {past.map(ev => (
                      <div key={ev.id} className="mini-card" style={{opacity: 0.65}}>
                        <div className="mini-card-dot" style={{background: ev.accentColor}} />
                        <div>
                          <div className="mini-card-title">{ev.title}</div>
                          <div className="mini-card-meta">📅 {ev.date} · 📍 {ev.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>}
              </>;
            })()}
          </div>
        )}

        {/* NAV */}
        <nav className="nav">
          <button className={`nav-item ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L10 2L17 9V18H13V13H7V18H3V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>Home</span>
          </button>
          <button className={`nav-item ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Crea</span>
          </button>
          <button className={`nav-item ${tab === "events" ? "active" : ""}`} onClick={() => setTab("events")}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="2" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="13" r="1" fill="currentColor"/>
            </svg>
            <span>Eventi</span>
          </button>
          <button className={`nav-item ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
            <div style={{position:"relative", display:"inline-flex"}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M3 17C3 14 6 12 10 12C14 12 17 14 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              {notifications.length > 0 && (
                <div style={{position:"absolute", top:"-6px", right:"-6px", width:"18px", height:"18px", borderRadius:"50%", background:"#D63030", border:"2px solid var(--soil)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:"700", color:"white", fontFamily:"DM Sans, sans-serif"}}>
                  {notifications.length}
                </div>
              )}
            </div>
            <span>Profilo</span>
          </button>
        </nav>

        {showAvailability && (() => {
          const FASCE = ["Mattina · 9:00–12:00","Pranzo · 12:00–14:00","Pomeriggio · 14:00–17:00","Aperitivo · 17:00–20:00","Cena · 20:00–22:00","Sera · 22:00–24:00"];
          const today = new Date();
          const days = Array.from({length: 30}, (_, i) => {
            const d = new Date(today); d.setDate(today.getDate() + i + 1);
            return d;
          });
          const fmt = d => d.toISOString().split("T")[0];
          const fmtLabel = d => d.toLocaleDateString("it-IT", {weekday:"short", day:"numeric", month:"short"});
          const toggleDay = (key) => setAvailability(a => {
            const next = {...a};
            if (next[key]) delete next[key]; else next[key] = [];
            return next;
          });
          const toggleFascia = (key, fascia) => setAvailability(a => {
            const curr = a[key] || [];
            const next = curr.includes(fascia) ? curr.filter(f => f !== fascia) : [...curr, fascia];
            return {...a, [key]: next};
          });
          const selectedDays = Object.keys(availability).filter(k => availability[k].length > 0);
          return (
            <div style={{position:"fixed", inset:0, zIndex:400, background:"var(--cream)", overflowY:"auto", padding:"52px 24px 40px"}}>
              <button onClick={() => setShowAvailability(false)}
                style={{background:"none", border:"none", cursor:"pointer", marginBottom:"20px", display:"flex", alignItems:"center", gap:"6px", color:"var(--bark)", fontFamily:"DM Sans, sans-serif", fontSize:"14px"}}>
                ← Indietro
              </button>

              <div style={{marginBottom:"20px"}}>
                <div style={{fontSize:"13px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--soil)", marginBottom:"6px"}}>
                  Seleziona i giorni in cui sei disponibile
                </div>
                <div style={{fontSize:"12px", color:"var(--bark)", lineHeight:"1.5"}}>
                  Più date scegli, più sarà facile trovare un momento che vada bene a tutti — basta che almeno due persone abbiano una disponibilità in comune per confermare l'incontro.
                </div>
              </div>

              <div style={{display:"flex", flexDirection:"column", gap:"8px", marginBottom:"28px"}}>
                {days.map(d => {
                  const key = fmt(d);
                  const selected = !!availability[key];
                  const fasce = availability[key] || [];
                  return (
                    <div key={key}>
                      <button onClick={() => toggleDay(key)}
                        style={{width:"100%", padding:"11px 14px", borderRadius:"12px", border:"1.5px solid",
                          borderColor: selected ? "var(--soil)" : "var(--sand)",
                          background: selected ? "var(--soil)" : "white",
                          color: selected ? "var(--cream)" : "var(--soil)",
                          fontFamily:"DM Sans, sans-serif", fontSize:"14px", fontWeight:"500",
                          cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <span>{fmtLabel(d)}</span>
                        <span style={{fontSize:"12px", opacity:0.7}}>{selected ? "✓" : "+"}</span>
                      </button>
                      {selected && (
                        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginTop:"6px", paddingLeft:"8px"}}>
                          {FASCE.map(f => (
                            <button key={f} onClick={() => toggleFascia(key, f)}
                              style={{padding:"8px 10px", borderRadius:"10px", border:"1.5px solid",
                                borderColor: fasce.includes(f) ? "var(--rose)" : "var(--sand)",
                                background: fasce.includes(f) ? "var(--rose-light)" : "white",
                                color: fasce.includes(f) ? "var(--rose)" : "var(--bark)",
                                fontFamily:"DM Sans, sans-serif", fontSize:"12px", cursor:"pointer"}}>
                              {f}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (selectedDays.length === 0) return showToast("Seleziona almeno un giorno con una fascia oraria", "error");
                  // Check overlap with other participants
                  const others = otherAvailability[detail] || [];
                  let matchDay = null, matchFascia = null;
                  for (const day of Object.keys(availability)) {
                    const myFasce = availability[day];
                    const othersOnDay = others.filter(o => o.days[day]);
                    if (othersOnDay.length >= 1) {
                      for (const fascia of myFasce) {
                        if (othersOnDay.some(o => o.days[day].includes(fascia))) {
                          matchDay = day; matchFascia = fascia; break;
                        }
                      }
                    }
                    if (matchDay) break;
                  }
                  if (matchDay) {
                    const d = new Date(matchDay);
                    const label = d.toLocaleDateString("it-IT", {weekday:"short", day:"numeric", month:"short"});
                    const ev = events.find(e => e.id === detail);
                    setConfirmedDates(cd => ({...cd, [detail]: { date: label, time: matchFascia, location: ev?.location }}));
                    setNotifications(n => [...n, { eventId: detail, title: ev?.title, date: label, time: matchFascia }]);
                  }
                  setShowAvailability(false);
                  setShowMotivation(true);
                }}
                style={{width:"100%", padding:"15px", borderRadius:"16px", border:"none",
                  background:"var(--soil)", color:"var(--cream)", cursor:"pointer",
                  fontFamily:"DM Sans, sans-serif", fontSize:"15px", fontWeight:"500"}}>
                Continua →
              </button>
            </div>
          );
        })()}

        {showGuide && (
          <div style={{position:"fixed", inset:0, zIndex:400, background:"var(--cream)", overflowY:"auto", padding:"52px 24px 40px"}}>
            <button onClick={() => setShowGuide(false)}
              style={{background:"none", border:"none", cursor:"pointer", marginBottom:"24px", display:"flex", alignItems:"center", gap:"6px", color:"var(--bark)", fontFamily:"DM Sans, sans-serif", fontSize:"14px"}}>
              ← Indietro
            </button>

            <h1 style={{fontFamily:"Playfair Display, serif", fontSize:"28px", color:"var(--soil)", marginBottom:"8px"}}>Cos'è AFFINI</h1>
            <p style={{fontSize:"14px", color:"var(--bark)", lineHeight:"1.7", marginBottom:"28px"}}>
AFFINI nasce da un'idea semplice:<br/>a volte si sente il bisogno di parlare con qualcuno.<br/>Non un amico, non uno psicologo, ma qualcuno che può capirti davvero, senza troppe spiegazioni.<br/>Qualcuno che sta vivendo o ha vissuto esattamente la tua stessa fase di vita.
            </p>

            <h2 style={{fontFamily:"Playfair Display, serif", fontSize:"20px", color:"var(--soil)", marginBottom:"12px"}}>Come funziona</h2>
            <div style={{display:"flex", flexDirection:"column", gap:"14px", marginBottom:"28px"}}>
              {/* Step 1 */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"28px", height:"28px", borderRadius:"50%", background:"var(--soil)", color:"var(--cream)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", flexShrink:0}}>1</div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>HOME: esplora i Topic</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6", paddingLeft:"42px", whiteSpace:"pre-line"}}>{"Ogni Topic è creato da una persona reale che vuole incontrare anime affini.\nFiltra per hashtag per trovare gli argomenti a cui sei interessato, o lasciati ispirare da quelli suggeriti."}</div>
              </div>

              {/* Step 3 */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--soil)", flexShrink:0, marginTop:"6px"}}></div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>ISCRIVITI!</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6", paddingLeft:"42px"}}>Clicca sul topic che ti interessa. Scegli la tua posizione (se stai vivendo quella situazione o ci sei già passat*) e racconta brevemente cosa ti lega a quel topic. Queste informazioni saranno visibili solo agli altri iscritti, per arrivare all'incontro con una buona base per rompere il ghiaccio.</div>

              {/* Step - Data da definire */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--soil)", flexShrink:0, marginTop:"6px"}}></div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>DATA DA DEFINIRE</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6", paddingLeft:"22px"}}>Quando il creatore del topic non fissa subito una data, ogni iscritto inserisce le proprie disponibilità scegliendo giorni e fasce orarie. Più opzioni inserisci, più faciliti l'incontro. Appena almeno due persone condividono una stessa disponibilità, data e orario vengono confermati automaticamente.</div>
              </div>
              </div>

              {/* Step 4 */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--soil)", flexShrink:0, marginTop:"6px"}}></div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>NO CHAT</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6"}}>L'assenza di una chat non è una scelta casuale. Lo scopo è conoscersi direttamente dal vivo e darsi una possibilità senza pregiudizi. Un'occasione sempre più rara.</div>
              </div>

              {/* Step 2 */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--soil)", flexShrink:0, marginTop:"6px"}}></div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>CREA: apri il tuo topic</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6", paddingLeft:"42px"}}>Clicca su CREA e scrivi il tuo topic. Scegli il formato (one to one, standard o gruppo), aggiungi 3 hashtag per farti trovare e scegli data e luogo.</div>

              {/* Sblocco abbonamento */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--soil)", flexShrink:0, marginTop:"6px"}}></div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>CREA E RISPARMIA</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6", paddingLeft:"22px"}}>Se crei un topic e raggiunge il numero minimo di iscritti necessari per tenerlo, il mese di abbonamento è tuo gratis. Il tuo contributo alla community vale quanto 5€.</div>
              </div>

              {/* EVENTI */}
              <div style={{marginBottom:"18px"}}>
                <div style={{display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"8px"}}>
                  <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--soil)", flexShrink:0, marginTop:"6px"}}></div>
                  <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", paddingTop:"4px"}}>EVENTI</div>
                </div>
                <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.6", paddingLeft:"22px"}}>Ogni mese AFFINI organizza un evento dal vivo dedicato al topic più discusso della community. Non un semplice incontro, ma una vera e propria esperienza per coinvolgere e ispirare. Trovi tutto nella sezione Eventi.</div>
              </div>
              </div>
            </div>

            <h2 style={{fontFamily:"Playfair Display, serif", fontSize:"20px", color:"var(--soil)", marginBottom:"12px"}}>Abbonamento</h2>
            <div style={{background:"white", borderRadius:"16px", padding:"18px", marginBottom:"12px", border:"1.5px solid var(--sand)"}}>
              <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", marginBottom:"6px"}}>🌱 Primo incontro del mese</div>
              <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.5"}}>Gratuito per tutti. Iscriviti, partecipa, scopri com'è AFFINI senza spendere nulla.</div>
            </div>
            <div style={{background:"white", borderRadius:"16px", padding:"18px", marginBottom:"12px", border:"1.5px solid var(--sand)"}}>
              <div style={{fontSize:"14px", fontWeight:"600", color:"var(--soil)", marginBottom:"6px"}}>✨ Incontri illimitati — 5€/mese</div>
              <div style={{fontSize:"13px", color:"var(--bark)", lineHeight:"1.5"}}>Dal secondo incontro in poi, sblocchi tutti gli incontri del mese con 5€. Oppure crea un topic che raggiunga almeno 2 iscritti e il mese è tuo gratis.</div>
            </div>
            <div style={{background:"var(--rose-light)", borderRadius:"16px", padding:"18px", marginBottom:"28px", border:"1.5px solid var(--rose-mid)"}}>
              <div style={{fontSize:"13px", color:"var(--rose)", lineHeight:"1.5", fontStyle:"italic"}}>Il tuo mese parte dal giorno in cui attivi l'abbonamento e dura 30 giorni — come Canva, Spotify e tutti i servizi che conosci.</div>
            </div>

            <button onClick={() => setShowGuide(false)}
              style={{width:"100%", padding:"15px", borderRadius:"16px", border:"none", background:"var(--soil)", color:"var(--cream)", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"15px", fontWeight:"500"}}>
              Inizia a esplorare →
            </button>
          </div>
        )}

        {viewingProfile && (
          <div style={{position:"fixed", inset:0, zIndex:500, background:"rgba(61,43,31,0.4)", display:"flex", alignItems:"flex-end", justifyContent:"center"}}
            onClick={() => setViewingProfile(null)}>
            <div style={{background:"var(--cream)", width:"100%", maxWidth:"420px", borderRadius:"20px 20px 0 0", padding:"28px 24px 44px"}}
              onClick={e => e.stopPropagation()}>
              <div style={{textAlign:"center", marginBottom:"16px"}}>
                <div style={{width:"72px", height:"72px", borderRadius:"50%", background:"var(--sand)", margin:"0 auto 10px", fontSize:"36px", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden"}}>
                  {viewingProfile.photo ? <img src={viewingProfile.photo} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : viewingProfile.avatar}
                </div>
                <div style={{fontFamily:"Playfair Display, serif", fontSize:"20px", color:"var(--soil)", fontWeight:"700"}}>{viewingProfile.name}</div>
              </div>
              <div style={{background:"white", borderRadius:"14px", padding:"16px", marginBottom:"20px"}}>
                <div style={{fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--bark)", marginBottom:"8px", fontWeight:"500"}}>Chi sono</div>
                <div style={{fontSize:"14px", color:"var(--soil)", lineHeight:"1.6", fontStyle:"italic"}}>"{viewingProfile.bio}"</div>
              </div>
              <button onClick={() => setViewingProfile(null)}
                style={{width:"100%", padding:"13px", borderRadius:"12px", border:"1.5px solid var(--sand)", background:"white", color:"var(--bark)", cursor:"pointer", fontFamily:"DM Sans, sans-serif", fontSize:"14px"}}>
                Chiudi
              </button>
            </div>
          </div>
        )}

        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  );
}

// ============================================
// SCHERMATA LOGIN / REGISTRAZIONE
// ============================================
function AuthScreen() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || "Nuovo utente" } },
      });
      if (error) setError(error.message);
      else setError("✓ Controlla la tua email per confermare la registrazione!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F9F3F0; font-family: 'DM Sans', sans-serif; }
      `}</style>
      <div style={{
        minHeight: "100vh", maxWidth: "420px", margin: "0 auto",
        background: "#F9F3F0", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "32px 28px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontFamily: "Playfair Display, serif", fontSize: "44px", fontWeight: 700,
            letterSpacing: "-1px", color: "#3D2B1F"
          }}>
            AF<span style={{ color: "#B5737A" }}>F</span>INI
          </div>
          <div style={{ fontSize: "12px", color: "#8B6F4E", marginTop: "4px", letterSpacing: "1px" }}>
            PER OGNI FASE DI VITA
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "signup" && (
            <input
              placeholder="Il tuo nome"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #EFE3DD",
                background: "white", fontSize: "14px", outline: "none"
              }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #EFE3DD",
              background: "white", fontSize: "14px", outline: "none"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #EFE3DD",
              background: "white", fontSize: "14px", outline: "none"
            }}
          />

          {error && (
            <div style={{
              fontSize: "13px", color: error.startsWith("✓") ? "#4A6741" : "#B5737A",
              background: error.startsWith("✓") ? "#EBF5E9" : "#F2DDE0",
              padding: "10px 14px", borderRadius: "10px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "15px", borderRadius: "16px", border: "none",
              background: "#3D2B1F", color: "#F9F3F0", fontSize: "15px",
              fontWeight: 500, cursor: "pointer", marginTop: "8px",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Un attimo..." : mode === "login" ? "Accedi" : "Crea il tuo profilo"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          style={{
            background: "none", border: "none", marginTop: "20px",
            color: "#8B6F4E", fontSize: "13px", cursor: "pointer", textAlign: "center"
          }}
        >
          {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
        </button>
      </div>
    </>
  );
}

// ============================================
// APP — gestisce la sessione utente
// ============================================
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F9F3F0", fontFamily: "DM Sans, sans-serif", color: "#8B6F4E"
      }}>
        Caricamento...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <AffiniAppContent session={session} />;
}

