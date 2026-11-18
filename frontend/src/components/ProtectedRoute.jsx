import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [shown, setShown] = useState(false);
  const [ack, setAck] = useState(false);

  const unauthorized =
    !!user && allowedRoles.length > 0 && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (unauthorized && !shown) {
      setShown(true);
      notify({
        variant: "error",
        code: "403 FORBIDDEN",
        title: "Akses Sistem Dibatasi",
        message: (
          <>
            Akun Anda (<b>{user.role}</b>) belum memiliki izin hak akses untuk
            modul ini. Silakan hubungi admin sistem PPIC untuk bantuan otorisasi
            akses kerja Anda.
          </>
        ),
        details: [
          {
            label: "Departemen",
            value: "PPIC • PT Summit Adyawinsa Indonesia",
          },
          { label: "Kontak Helpdesk", value: "admin.ppic@summit-adw.co.id" },
          {
            label: "Ext. Internal Plant",
            value: "Ext. 2404 (Ruang PPIC Karawang)",
          },
        ],
        secondaryLabel: "Kirim Tiket Akses",
        onSecondary: () =>
          (window.location.href =
            "mailto:admin.ppic@summit-adw.co.id?subject=Permintaan Akses Sistem PPIC"),
      }).then(() => setAck(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unauthorized]);

  if (!user) return <Navigate to="/login" replace />;
  if (unauthorized) return ack ? <Navigate to="/" replace /> : null;
  return children;
}
