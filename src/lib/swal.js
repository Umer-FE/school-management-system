import Swal from "sweetalert2";

export const showSuccess = (title, text = "") => {
    return Swal.fire({
        title,
        text,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
    });
};

export const showError = (title, text = "") => {
    return Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonColor: "#d33",
    });
};

export const showConfirm = (title, text = "", onConfirm = null, confirmText = "Yes, proceed!") => {
    return Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#ef4444",
        confirmButtonText: confirmText,
        borderRadius: '24px',
    }).then((result) => {
        if (result.isConfirmed && onConfirm) {
            onConfirm();
        }
    });
};

export default Swal;
