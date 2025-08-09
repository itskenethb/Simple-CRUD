import React from "react";
import Swal from "sweetalert2";

export default function DeleteUserButton({ userId, onDeleted }) {
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/delete_user/${userId}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              Swal.fire("Deleted!", data.message, "success");
              onDeleted(); // notify parent to refresh list
            } else if (data.error) {
              Swal.fire("Error!", data.error, "error");
            }
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to delete user", "error");
          });
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      style={{
        backgroundColor: "#f44336",
        color: "white",
        padding: "6px 10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#d32f2f")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#f44336")}
    >
      Delete
    </button>
  );
}
