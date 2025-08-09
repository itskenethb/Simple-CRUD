import React from "react";
import Swal from "sweetalert2";

export default function EditUserButton({ userId, currentName, currentAddress, onEdited }) {
  // Store original values once, then always compare inputs to these
  const originalName = currentName.trim();
  const originalAddress = currentAddress.trim();

  const showEditPopup = (nameInit, addressInit) => {
    return Swal.fire({
      title: "Edit User",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Name" value="${nameInit}" />` +
        `<input id="swal-input2" class="swal2-input" placeholder="Address" value="${addressInit}" />`,

      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: "Cancel",
      allowOutsideClick: false,

      didOpen: () => {
        const input1 = Swal.getPopup().querySelector("#swal-input1");
        const input2 = Swal.getPopup().querySelector("#swal-input2");
        const confirmBtn = Swal.getConfirmButton();

        const validateInputs = () => {
          const nameVal = input1.value.trim();
          const addressVal = input2.value.trim();

          // Check if changed compared to *original* values (not current popup values)
          const changed =
            nameVal !== originalName || addressVal !== originalAddress;
          const filled = nameVal !== "" && addressVal !== "";

          confirmBtn.disabled = !(changed && filled);
        };

        input1.addEventListener("input", validateInputs);
        input2.addEventListener("input", validateInputs);

        // Initial check
        validateInputs();
      },
      preConfirm: () => {
        const name = document.getElementById("swal-input1").value.trim();
        const address = document.getElementById("swal-input2").value.trim();
        if (!name || !address) {
          Swal.showValidationMessage("Name and Address are required");
          return false;
        }
        return { name, address };
      },
    }).then((result) => result.value);
  };

  const handleEdit = async () => {
    let formValues = await showEditPopup(originalName, originalAddress);
    if (!formValues) return; // Cancelled

    while (true) {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this user?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        allowOutsideClick: false,
      });

      if (confirmResult.isConfirmed) {
        try {
          const response = await fetch(
            `http://127.0.0.1:5000/edit_user/${userId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formValues),
            }
          );
          const data = await response.json();

          if (data.message) {
            await Swal.fire("Success", data.message, "success");
            onEdited();
            break; // exit loop on success
          } else if (data.error) {
            await Swal.fire("Error", data.error, "error");

            if (
              data.error
                .toLowerCase()
                .includes("duplicate") ||
              data.error
                .toLowerCase()
                .includes("already exists") ||
              data.error
                .toLowerCase()
                .includes("unique constraint")
            ) {
              // On duplicate error, go back to edit popup, but compare inputs to *original* values again
              formValues = await showEditPopup(formValues.name, formValues.address);
              if (!formValues) break; // Cancelled
              continue;
            } else {
              break; // Other errors stop loop
            }
          }
        } catch {
          await Swal.fire("Error", "Failed to update user", "error");
          break;
        }
      } else {
        // User clicked No - go back to edit popup
        formValues = await showEditPopup(formValues.name, formValues.address);
        if (!formValues) break; // Cancelled
      }
    }
  };

  return (
    <button
      onClick={handleEdit}
      style={{
        backgroundColor: "#2196F3",
        color: "white",
        padding: "6px 10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "8px",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#1976D2")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#2196F3")}
    >
      Edit
    </button>
  );
}
