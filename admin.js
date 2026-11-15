
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
.select("*")
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

    const deskripsi = document.createElement("p");
    deskripsi.textContent = "Deskripsi: " + (item.deskripsi || "-");

    const pemilik = document.createElement("p");
    pemilik.textContent = "ID Pemilik: " + item.user_id;

    const status = document.createElement("p");
    status.textContent = "Status: " + (item.status || "aktif");

    const tombolStatus = document.createElement("button");
    const sedangAktif = item.status !== "nonaktif";

    tombolStatus.textContent = sedangAktif
        ? "Nonaktifkan Toko"
        : "Aktifkan Kembali";

    tombolStatus.style.background = sedangAktif ? "#dc2626" : "#16a34a";
    tombolStatus.style.color = "white";
    tombolStatus.style.padding = "10px 15px";
    tombolStatus.style.border = "none";
    tombolStatus.style.borderRadius = "6px";
    tombolStatus.style.cursor = "pointer";

    tombolStatus.addEventListener("click", async () => {
        const statusBaru = sedangAktif ? "nonaktif" : "aktif";

        const yakin = confirm(
            `Ubah status toko ${item.nama_toko} menjadi ${statusBaru}?`
        );

        if (!yakin) return;

        tombolStatus.disabled = true;

        const { error } = await supabase
            .from("toko")
            .update({ status: statusBaru })
            .eq("id", item.id);

        if (error) {
            alert("Gagal mengubah status: " + error.message);
            tombolStatus.disabled = false;
            return;
        }

        alert("Status toko berhasil diubah.");
        tampilkanToko();
    });

    kartu.append(nama, deskripsi, pemilik, status, tombolStatus);
    daftar.appendChild(kartu);
});

};


// Menu produk
window.tampilkanProduk = async function () {
    areaAdmin.innerHTML = `
        <h3>Kelola Produk</h3>
        <p>Memuat data produk...</p>
    `;

    const { data: produk, error } = await supabase
        .from("produk")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        areaAdmin.innerHTML = `
            <h3>Kelola Produk</h3>
            <p>Gagal memuat produk: ${error.message}</p>
        `;
        return;
    }

    if (!produk || produk.length === 0) {
        areaAdmin.innerHTML = `
            <h3>Kelola Produk</h3>
            <p>Belum ada produk.</p>
        `;
        return;
    }

    areaAdmin.innerHTML = `
        <h3>Daftar Produk (${produk.length})</h3>
        <div id="daftarProduk"></div>
    `;

    const daftar = document.getElementById("daftarProduk");

    produk.forEach(item => {
        const kartu = document.createElement("div");
        kartu.style.border = "1px solid #ddd";
        kartu.style.padding = "15px";
        kartu.style.margin = "10px 0";
        kartu.style.borderRadius = "8px";

        const nama = document.createElement("h4");
        nama.textContent = item.nama || "Tanpa nama";

        const harga = document.createElement("p");
        harga.textContent = "Harga: Rp " + Number(item.harga || 0).toLocaleString("id-ID");

        const toko = document.createElement("p");
        toko.textContent = "ID Toko: " + (item.toko_id || "-");

        const status = document.createElement("p");
        status.textContent = "Status: " + (item.status || "aktif");

        const tombol = document.createElement("button");
        const sedangAktif = item.status !== "nonaktif";

        tombol.textContent = sedangAktif
            ? "Nonaktifkan Produk"
            : "Aktifkan Produk";

        tombol.addEventListener("click", async () => {
            const statusBaru = sedangAktif ? "nonaktif" : "aktif";

            if (!confirm(`Ubah status produk ${item.nama} menjadi ${statusBaru}?`)) {
                return;
            }

            tombol.disabled = true;

            const { error } = await supabase
                .from("produk")
                .update({ status: statusBaru })
                .eq("id", item.id);

            if (error) {
                alert("Gagal mengubah status: " + error.message);
                tombol.disabled = false;
                return;
            }

            alert("Status produk berhasil diubah.");
            tampilkanProduk();
        });

        kartu.append(nama, harga, toko, status, tombol);
        daftar.appendChild(kartu);
    });
};

btnToko.addEventListener("click", tampilkanToko);
btnProduk.addEventListener("click", tampilkanProduk);

periksaAdmin();