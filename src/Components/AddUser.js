import React, { useState, useEffect } from "react";
import DisplayUser from "./DisplayUser";

export default function AddUser() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

   useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:5000/add_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setMessageType("success");
        setName("");
        setAddress("");

        // Show the table and refresh it on successful add
        setShowTable(true);
        setRefreshCount((prev) => prev + 1);

      } else {
        setMessage(result.error || "Something went wrong");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
    }
  };

  const buttonStyle = {
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  // Optional: manual show table button
  const handleSeeTable = () => {
    setShowTable(true);
    setRefreshCount((prev) => prev + 1);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto auto",
          gap: "10px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          type="submit"
          style={{ ...buttonStyle, backgroundColor: "#4CAF50", color: "white" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleSeeTable}
          style={{ ...buttonStyle, backgroundColor: "#2196F3", color: "white" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1976D2")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#2196F3")}
        >
          See Table
        </button>
      </form>

      {message && (
        <p
          style={{
            marginBottom: "15px",
            textAlign: "center",
            fontWeight: "bold",
            color: messageType === "success" ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}

      {showTable && (
        <DisplayUser
          key={refreshCount}  // forces remount to refresh data
          refreshCount={refreshCount}
          onClose={() => setShowTable(false)}
        />
      )}
    </div>
  );
}
