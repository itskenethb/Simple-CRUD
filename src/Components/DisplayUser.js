import React, { useEffect, useState } from "react";
import DeleteUserButton from "./DeleteUser.js";
import EditUserButton from "./EditUser.js";

export default function DisplayUser({ onClose }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users either all or filtered by search
  const fetchUsers = (query = "") => {
    const url = query
      ? `http://localhost:5000/search_users?query=${encodeURIComponent(query)}`
      : "http://localhost:5000/display_users";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setError("");
        } else {
          setUsers([]);
          setError("No users found");
        }
      })
      .catch(() => {
        setError("Error fetching users");
        setUsers([]);
      });
  };

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users when searchQuery changes with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Clear error after 3 seconds if it's not "No users found"
  useEffect(() => {
    if (error && error !== "No users found") {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Show search input only if users exist OR user has typed something */}
      {(users.length > 0 || searchQuery.length > 0) && (
        <input
          type="text"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            boxSizing: "border-box",
            fontSize: "16px",
          }}
        />
      )}

      {/* Show error message */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Display users table if users exist */}
      {users.length > 0 ? (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Address</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.id}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.address}</td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <EditUserButton
                      userId={u.id}
                      currentName={u.name}
                      currentAddress={u.address}
                      onEdited={() => fetchUsers(searchQuery)}
                    />
                    <DeleteUserButton userId={u.id} onDeleted={() => fetchUsers(searchQuery)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "8px 12px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d32f2f")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
            >
              Close
            </button>
          </div>
        </>
      ) : (
        // Show message if no users and no error
        !error && <p style={{ textAlign: "center" }}>No users found</p>
      )}
    </div>
  );
}
