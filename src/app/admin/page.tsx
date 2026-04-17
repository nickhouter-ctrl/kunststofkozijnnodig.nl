"use client";

import { useEffect, useState, useCallback } from "react";
import { Lock, Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

type Project = {
  id: string;
  slug: string;
  title: string;
  location: string;
  year: string;
  category: string;
  products: string[];
  summary: string;
  description: string;
  cover: string;
  images: string[];
  review_name: string | null;
  review_text: string | null;
  review_rating: number;
  published: boolean;
  sort_order: number;
};

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/check");
    setAuth(res.ok);
    setChecking(false);
    if (res.ok) loadProjects();
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async () => {
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuth(true);
      loadProjects();
    } else {
      setLoginError("Onjuist wachtwoord");
    }
  };

  const loadProjects = async () => {
    const res = await fetch("/api/admin/projects");
    if (res.ok) setProjects(await res.json());
  };

  const saveProject = async () => {
    if (!editing) return;
    const method = editing.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      loadProjects();
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit project wilt verwijderen?")) return;
    await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadProjects();
  };

  const togglePublished = async (project: Project) => {
    await fetch("/api/admin/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, published: !project.published }),
    });
    loadProjects();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", editing.slug);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setEditing({
        ...editing,
        images: [...editing.images, url],
        cover: editing.cover || url,
      });
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    const newImages = editing.images.filter((_, i) => i !== idx);
    setEditing({
      ...editing,
      images: newImages,
      cover: newImages[0] || "",
    });
  };

  const setCover = (url: string) => {
    if (!editing) return;
    setEditing({ ...editing, cover: url });
  };

  const newProject = () => {
    setEditing({
      id: "",
      slug: "",
      title: "",
      location: "",
      year: "2025",
      category: "Renovatie",
      products: ["Kozijnen"],
      summary: "",
      description: "",
      cover: "",
      images: [],
      review_name: null,
      review_text: null,
      review_rating: 5,
      published: true,
      sort_order: projects.length,
    });
  };

  if (checking) return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">Laden...</div>;

  // Login screen
  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-8 ring-1 ring-white/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-center text-xl font-bold text-white">Admin Panel</h1>
          <p className="mt-1 text-center text-sm text-neutral-500">Voer het wachtwoord in</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="mt-6 w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
            placeholder="Wachtwoord"
            autoFocus
          />
          {loginError && <p className="mt-2 text-sm text-red-400">{loginError}</p>}
          <button onClick={login} className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Inloggen
          </button>
        </div>
      </div>
    );
  }

  // Edit form
  if (editing) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <button onClick={() => setEditing(null)} className="mb-6 flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Terug naar overzicht
          </button>

          <h1 className="text-2xl font-bold">{editing.id ? "Project bewerken" : "Nieuw project"}</h1>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Titel *</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Slug *</label>
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="bijv. complete-renovatie-zaandam"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Locatie</label>
              <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Jaar</label>
              <input value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })} className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Categorie</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
                <option>Renovatie</option>
                <option>Deuren</option>
                <option>Schuifpuien</option>
                <option>Gevelbekleding</option>
                <option>VvE</option>
                <option>Nieuwbouw</option>
                <option>Villa</option>
                <option>Levering</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Producten</label>
              <div className="flex flex-wrap gap-2">
                {["Kozijnen", "Deuren", "Schuifpuien"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const has = editing.products.includes(p);
                      setEditing({ ...editing, products: has ? editing.products.filter((x) => x !== p) : [...editing.products, p] });
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      editing.products.includes(p) ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Samenvatting</label>
            <textarea value={editing.summary ?? ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} rows={2} className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
          </div>

          <div className="mt-6">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Beschrijving</label>
            <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Review */}
          <div className="mt-8 rounded-xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Klantreview (optioneel)</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={editing.review_name ?? ""} onChange={(e) => setEditing({ ...editing, review_name: e.target.value })} placeholder="Naam klant" className="rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
              <select value={editing.review_rating} onChange={(e) => setEditing({ ...editing, review_rating: Number(e.target.value) })} className="rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sterren</option>)}
              </select>
            </div>
            <textarea value={editing.review_text ?? ""} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} rows={3} placeholder="Review tekst..." className="mt-4 w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Images */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Foto's</h3>
            <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
              {editing.images.map((img, i) => (
                <div key={img} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {img === editing.cover && (
                    <div className="absolute left-1 top-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">COVER</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setCover(img)} className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700" title="Stel in als cover">
                      <ImageIcon className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeImage(i)} className="rounded-full bg-red-600 p-2 text-white hover:bg-red-700" title="Verwijderen">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-neutral-500 hover:border-blue-500 hover:text-blue-400">
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">{uploading ? "Bezig..." : "Upload"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                  if (e.target.files) Array.from(e.target.files).forEach(uploadImage);
                }} />
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={saveProject} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              <Save className="h-4 w-4" /> Opslaan
            </button>
            <button onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-6 py-3 text-sm text-neutral-400 hover:text-white">
              Annuleren
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Project list
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projecten beheren</h1>
            <p className="mt-1 text-sm text-neutral-500">{projects.length} projecten</p>
          </div>
          <button onClick={newProject} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Nieuw project
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-neutral-900 p-4">
              <div className="h-16 w-16 flex-none overflow-hidden rounded-lg bg-neutral-800">
                {p.cover && <img src={p.cover} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.published ? "bg-green-900 text-green-300" : "bg-neutral-800 text-neutral-500"}`}>
                    {p.published ? "LIVE" : "CONCEPT"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {p.location} · {p.year} · {p.category} · {p.images.length} foto's
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePublished(p)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-800 hover:text-white" title={p.published ? "Verbergen" : "Publiceren"}>
                  {p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setEditing(p)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-800 hover:text-white" title="Bewerken">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteProject(p.id)} className="rounded-lg p-2 text-neutral-500 hover:bg-red-900 hover:text-red-300" title="Verwijderen">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
