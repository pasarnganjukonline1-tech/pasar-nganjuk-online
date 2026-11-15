
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jpszngdjpsgjbxchurzi.supabase.co";
const SUPABASE_KEY = "sb_publishable_sRfnpBpuz4fRqoC37kzVyA_tLS6a0Gj";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const areaAdmin = document.getElementById("areaAdmin");
const btnLogout = document.getElementById("btnLogout");

// Periksa login dan hak admin
async function periksaAdmin() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "login-penjual.html";
        return;
    }

    const { data, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !data) {
        alert("Akses ditolak! Akun ini bukan admin.");
        window.location.href = "index.html";
        return;
    }

    areaAdmin.innerHTML = `
        <h3>Akses Admin Terverifikasi</h3>
        <p>Dashboard siap digunakan.</p>
    `;
}

// Tombol keluar
btnLogout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login-penjual.html";
});

// Menu toko
window.tampilkanToko = function () {
    areaAdmin.innerHTML = "<h3>Kelola Toko Vendor</h3><p>Fitur akan kita buat berikutnya.</p>";
};

// Menu produk
window.tampilkanProduk = function () {
    areaAdmin.innerHTML = "<h3>Kelola Produk</h3><p>Fitur akan kita buat berikutnya.</p>";
};

periksaAdmin();
