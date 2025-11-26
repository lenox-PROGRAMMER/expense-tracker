import { useEffect, useState } from "react";
import axios from "axios";

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ category: "", amount: "", date: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!token) {
        setError("No token found. Please login.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:4000/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [token]);

  // Add or update expense
  const saveExpense = async () => {
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      if (editingId) {
        // Update existing expense
        const res = await axios.put(
          `http://localhost:4000/expenses/${editingId}`,
          {
            category: form.category,
            amount: parseFloat(form.amount),
            date: form.date,
            description: form.description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExpenses(expenses.map((exp) => (exp.id === editingId ? res.data : exp)));
        setEditingId(null);
      } else {
        // Add new expense
        const res = await axios.post(
          "http://localhost:4000/expenses",
          {
            category: form.category,
            amount: parseFloat(form.amount),
            date: form.date,
            description: form.description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExpenses([...expenses, res.data]);
      }
      setForm({ category: "", amount: "", date: "", description: "" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save expense");
    }
  };

  // Delete expense
  const deleteExpense = async (id: number) => {
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      await axios.delete(`http://localhost:4000/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((exp) => exp.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete expense");
    }
  };

  // Start editing
  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setForm({
      category: exp.category,
      amount: exp.amount.toString(),
      date: exp.date,
      description: exp.description || "",
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Expenses</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading expenses...</p>}

      <div style={{ marginBottom: "1rem" }}>
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
        <button onClick={saveExpense}>
          {editingId ? "Update Expense" : "Add Expense"}
        </button>
      </div>

      {expenses.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Date</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Category</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Amount</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Description</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.date}</td>
                <td>{exp.category}</td>
                <td>{exp.amount}</td>
                <td>{exp.description || "-"}</td>
                <td>
                  <button
                    onClick={() => startEdit(exp)}
                    style={{ marginRight: "0.5rem" }}
                  >
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
        !loading && <p>No expenses yet. Add one above!</p>
      )}
    </div>
  );
}
