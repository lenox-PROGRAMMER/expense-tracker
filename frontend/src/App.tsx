import { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";

import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type Expense = {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
};
function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ category: "", amount: "", date: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch expenses when token is available
  useEffect(() => {
    if (!token) return;

    const fetchExpenses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:4000/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setExpenses(data);
        } else {
          setError(data.error || "Failed to fetch expenses");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [token]);
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setExpenses([]);
  };

  // Save (Add or Update) expense
  const saveExpense = async () => {
    if (!token) return;
    try {
      if (editingId) {
        const res = await fetch(`http://localhost:4000/expenses/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setExpenses(expenses.map((exp) => (exp.id === editingId ? data : exp)));
          setEditingId(null);
        } else {
          setError(data.error || "Failed to update expense");
        }
      } else {
        const res = await fetch("http://localhost:4000/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setExpenses([...expenses, data]);
        } else {
          setError(data.error || "Failed to add expense");
        }
      }
      setForm({ category: "", amount: "", date: "", description: "" });
    } catch {
      setError("Network error");
    }
  };

  // Delete expense
  const deleteExpense = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:4000/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExpenses(expenses.filter((exp) => exp.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete expense");
      }
    } catch {
      setError("Network error");
    }
  };

  // Start editing
  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setForm({
      category: exp.category,
      amount: exp.amount.toString(),
      date: exp.date,
      description: exp.description,
    });
  };
  // Chart data for line chart (trend over time)
  const lineData = {
    labels: expenses.map((exp) => exp.date),
    datasets: [
      {
        label: "Expenses Trend",
        data: expenses.map((exp) => exp.amount),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.3)",
        tension: 0.3, // smooth curve
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Expense Trend Over Time" },
    },
  };

  // Chart data for pie chart (category breakdown)
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryTotals),
        backgroundColor: ["#38bdf8", "#f87171", "#34d399", "#fbbf24", "#a78bfa"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" as const },
      title: { display: true, text: "Category Breakdown" },
    },
  };
  // If not logged in, show login form
  if (!token) {
    return (
      <LoginForm
        onLogin={(newToken) => {
          localStorage.setItem("token", newToken);
          setToken(newToken);
        }}
      />
    );
  }

  return (
    <div className="container">
      <h1>Expense Tracker 💸</h1>
      <button onClick={handleLogout} style={{ marginBottom: "1rem" }}>
        Logout
      </button>

      {loading && <p>Loading expenses...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Dashboard layout: form left, charts right */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        {/* Add / Edit Form */}
        <div style={{ flex: 1, marginRight: "2rem" }}>
          <h3>Add / Edit Expense</h3>
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            placeholder="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button onClick={saveExpense} style={{ marginTop: "0.5rem" }}>
            {editingId ? "Update Expense" : "Add Expense"}
          </button>
        </div>

        {/* Charts */}
        <div style={{ flex: 1 }}>
          <h3>Analytics</h3>
          <Line data={lineData} options={lineOptions} />
          <div style={{ marginTop: "2rem", maxWidth: "400px" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {expenses.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.id}</td>
                <td>{exp.category}</td>
                <td>{exp.amount}</td>
                <td>{exp.date}</td>
                <td>{exp.description}</td>
                <td>
                  <button onClick={() => startEdit(exp)} style={{ marginRight: "0.5rem" }}>
                    Edit
                  </button>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    style={{ background: "red", color: "white" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No expenses found. Add some to get started!</p>
      )}
    </div>
  );
}

export default App;
