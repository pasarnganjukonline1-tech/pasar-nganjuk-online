
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jpszngdjpsgjbxchurzi.supabase.co";
const SUPABASE_KEY = "sb_publishable_sRfnpBpuz4fRqoC37kzVyA_tLS6a0Gj";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const areaAdmin = document.getElementById("areaAdmin");
const btnLogout = document.getElementById("btnLogout");
const btnToko = document.getElementById("btnToko");
const btnProduk = document.getElementById("btnProduk");
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

window.tampilkanToko = async function () {
    areaAdmin.innerHTML = "<h3>Kelola Toko Vendor</h3><p>Memuat data toko...</p>";

    const { data: toko, error } = await supabase
        .from("toko")
        .select("id, user_id, nama_toko, alamat, deskripsi, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        areaAdmin.innerHTML = `
            <h3>Kelola Toko Vendor</h3>
            <p>Gagal memuat toko: ${error.message}</p>
        `;
        return;
    }

    if (!toko || toko.length === 0) {
        areaAdmin.innerHTML = "<h3>Kelola Toko Vendor</h3><p>Belum ada toko terdaftar.</p>";
        return;
    }

    areaAdmin.innerHTML = `
        <h3>Daftar Toko Vendor (${toko.length})</h3>
        <div id="daftarToko"></div>
    `;

    const daftar = document.getElementById("daftarToko");

    toko.forEach(item => {
        const kartu = document.createElement("div");
        kartu.style.border = "1px solid #ddd";
        kartu.style.padding = "15px";
        kartu.style.margin = "10px 0";
        kartu.style.borderRadius = "8px";

        const nama = document.createElement("h4");
        nama.textContent = item.nama_toko || "Tanpa nama";

        const alamat = document.createElement("p");
        alamat.textContent = "Alamat: " + (item.alamat || "-");

        const pemilik = document.createElement("p");
        pemilik.textContent = "ID Pemilik: " + item.user_id;

        kartu.append(nama, alamat, pemilik);
        daftar.appendChild(kartu);
    });
};


// Menu produk
window.tampilkanProduk = function () {
    areaAdmin.innerHTML = "<h3>Kelola Produk</h3><p>Fitur akan kita buat berikutnya.</p>";
};

btnToko.addEventListener("click", tampilkanToko);
btnProduk.addEventListener("click", tampilkanProduk);

periksaAdmin();