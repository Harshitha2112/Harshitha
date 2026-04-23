import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyRecipes, deleteRecipe } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import RecipeCard from "../components/recipes/RecipeCard";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, BookOpen, Clock, ChefHat } from "lucide-react";

const StatusBadge = ({ status }) => {
  const config = {
    approved: { class: "badge-green",  label: "✓ Approved" },
    pending:  { class: "badge-yellow", label: "⏳ Pending" },
    rejected: { class: "badge-red",    label: "✗ Rejected" },
  };
  const c = config[status] || config.pending;
  return <span className={`badge ${c.class}`}>{c.label}</span>;
};

const Dashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    refreshUser();
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try { const { data } = await getMyRecipes(); setMyRecipes(data); }
    catch { toast.error("Failed to load your recipes"); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      setMyRecipes(r => r.filter(recipe => recipe._id !== id));
      toast.success("Recipe deleted!");
    } catch { toast.error("Failed to delete recipe"); }
  };

  const filtered = myRecipes.filter(r => activeTab === "all" || r.status === activeTab);

  const stats = [
    { label: "Total Recipes",    value: myRecipes.length,                                    icon: <BookOpen size={20} color="var(--accent)" /> },
    { label: "Approved",         value: myRecipes.filter(r => r.status === "approved").length, icon: <span style={{ fontSize: "1.25rem" }}>✅</span> },
    { label: "Pending Review",   value: myRecipes.filter(r => r.status === "pending").length,  icon: <Clock size={20} color="#eab308" /> },
    { label: "Saved Recipes",    value: user?.savedRecipes?.length || 0,                      icon: <span style={{ fontSize: "1.25rem" }}>🔖</span> },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: "#fff", fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "1.4rem" }}>Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              <span className={`badge ${user?.role === "ADMIN" ? "badge-red" : user?.role === "SUBADMIN" ? "badge-blue" : "badge-green"}`}>
                {user?.role}
              </span>
            </p>
          </div>
        </div>
        <Link to="/recipes/create" className="btn-primary">
          <PlusCircle size={16} /> New Recipe
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              {s.icon}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {user?.notifications?.filter(n => !n.read).length > 0 && (
        <div style={{ background: "var(--accent-light)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "2rem" }}>
          <h3 style={{ fontWeight: 700, color: "var(--accent)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>🔔 New Notifications</h3>
          {user.notifications.filter(n => !n.read).map((n, i) => (
            <p key={i} style={{ fontSize: "0.875rem", color: "var(--text-primary)", padding: "0.25rem 0" }}>{n.message}</p>
          ))}
        </div>
      )}

      {/* My Recipes */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>My Recipes</h2>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["all", "approved", "pending", "rejected"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.4rem 0.85rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600,
                  border: "1px solid var(--border)", cursor: "pointer", textTransform: "capitalize",
                  background: activeTab === tab ? "var(--accent)" : "var(--glass)",
                  color: activeTab === tab ? "#fff" : "var(--text-secondary)"
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="recipe-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: "220px" }} />
                <div style={{ padding: "1rem", background: "var(--bg-card)" }}>
                  <div className="skeleton" style={{ height: "18px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: "14px", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <ChefHat size={48} color="var(--text-secondary)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>No recipes yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem", fontSize: "0.875rem" }}>Start creating your first recipe!</p>
            <Link to="/recipes/create" className="btn-primary">
              <PlusCircle size={16} /> Create Recipe
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map(recipe => (
              <div key={recipe._id} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <img src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop"} alt={recipe.title}
                  style={{ width: "72px", height: "72px", borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0 }}
                  onError={e => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{recipe.title}</h3>
                    <StatusBadge status={recipe.status} />
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{recipe.category} • {recipe.cookingTime} mins • ⭐ {recipe.averageRating?.toFixed(1) || "0.0"}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link to={`/recipes/${recipe._id}`} className="btn-secondary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>View</Link>
                  <Link to={`/recipes/edit/${recipe._id}`} className="btn-secondary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Edit</Link>
                  <button onClick={() => handleDelete(recipe._id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.6rem", padding: "0.4rem 0.6rem", cursor: "pointer", color: "#ef4444" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
