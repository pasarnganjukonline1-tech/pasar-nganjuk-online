
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jpszngdjpsgjbxchurzi.supabase.co";
const SUPABASE_KEY = "sb_publishable_sRfnpBpuz4fRqoC37kzVyA_tLS6a0Gj";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const areaAdmin = document.getElementById("areaAdmin");
const btnLogout = document.getElementById("btnLogout");
const btnToko = document.getElementById("btnToko");
const btnProduk = document.getElementById("btnProduk");
const btnDashboard = document.getElementById("btnDashboard");
const btnPesanan = document.getElementById("btnPesanan");
const btnMenuToko = document.getElementById("btnMenuToko");
const btnMenuProduk = document.getElementById("btnMenuProduk");

// Memuat statistik dashboard admin
async function muatStatistikAdmin() {
    const { count: jumlahToko, error: errorToko } = await supabase
        .from("toko")
        .select("id", { count: "exact", head: true });

    const { count: jumlahProduk, error: errorProduk } = await supabase
        .from("produk")
        .select("id", { count: "exact", head: true });

    const { count: jumlahPesanan, error: errorPesanan } = await supabase
        .from("pesanan")
        .select("id", { count: "exact", head: true });

    const { count: jumlahTokoAktif, error: errorAktif } = await supabase
        .from("toko")
        .select("id", { count: "exact", head: true })
        .eq("status", "aktif");

    document.getElementById("totalToko").textContent =
        errorToko ? "-" : jumlahToko;

    document.getElementById("totalProduk").textContent =
        errorProduk ? "-" : jumlahProduk;

    document.getElementById("totalPesanan").textContent =
        errorPesanan ? "-" : jumlahPesanan;

    document.getElementById("tokoAktif").textContent =
        errorAktif ? "-" : jumlahTokoAktif;
}


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

    await muatStatistikAdmin();
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

    <input
        type="text"
        id="cariToko"
        placeholder="Cari nama toko..."
        style="width:100%; padding:12px; margin:15px 0; border:1px solid #ddd; border-radius:8px;"
    >

    <div id="daftarToko"></div>
`;

    const daftar = document.getElementById("daftarToko");

   
toko.forEach(item => {
    const kartu = document.createElement("div");
    kartu.style.border = "1px solid #ddd";
    kartu.style.padding = "15px";
    kartu.style.margin = "10px 0";
    kartu.style.borderRadius = "8px";

    const foto = document.createElement("img");
    foto.src = item.gambar_url || "";
    console.log("Foto produk:", item.nama, item.gambar_url);
    foto.alt = item.nama || "Foto produk";
    foto.style.width = "100px";
    foto.style.height = "100px";
    foto.style.objectFit = "cover";
    foto.style.borderRadius = "10px";
    foto.style.marginBottom = "10px";

    const nama = document.createElement("h4");
    nama.textContent = item.nama_toko || "Tanpa nama";

    const deskripsi = document.createElement("p");
    deskripsi.textContent = "Deskripsi: " + (item.deskripsi || "-");

    const lokasi = document.createElement("p");
lokasi.textContent = "Lokasi: " + (item.lokasi || "-");

    const pemilik = document.createElement("p");
    pemilik.textContent = "ID Pemilik: " + item.user_id;

    const status = document.createElement("p");

status.textContent = item.status === "nonaktif"
    ? "Status: Nonaktif"
    : "Status: Aktif";

status.style.color = item.status === "nonaktif"
    ? "#dc2626"
    : "#16a34a";

status.style.fontWeight = "bold";

    // Status verifikasi vendor
    const statusVerifikasi = document.createElement("p");
    statusVerifikasi.textContent =
        "Verifikasi: " + (item.status_verifikasi || "Menunggu");
    statusVerifikasi.style.fontWeight = "bold";
    statusVerifikasi.style.color =
        item.status_verifikasi === "Terverifikasi"
            ? "#16a34a"
            : item.status_verifikasi === "Ditolak"
                ? "#dc2626"
                : "#d97706";


    const areaVerifikasi = document.createElement("div");
areaVerifikasi.style.background = "#f8fafc";
areaVerifikasi.style.border = "1px solid #cbd5e1";
areaVerifikasi.style.borderRadius = "10px";
areaVerifikasi.style.padding = "15px";
areaVerifikasi.style.marginTop = "15px";

    const alasan = document.createElement("p");
    alasan.textContent = item.alasan_penolakan
        ? "Alasan penolakan: " + item.alasan_penolakan
        : "";

    async function ubahVerifikasi(statusBaru) {
        let alasanBaru = null;

        if (statusBaru === "Ditolak") {
            alasanBaru = prompt("Masukkan alasan penolakan:");

            if (!alasanBaru || !alasanBaru.trim()) {
                alert("Alasan penolakan wajib diisi.");
                return;
            }

            alasanBaru = alasanBaru.trim();
            areaVerifikasi.append(
    statusVerifikasi,
    alasan
);
        }

        if (!confirm(
            `Ubah verifikasi ${item.nama_toko} menjadi ${statusBaru}?`
        )) return;

        const { error } = await supabase.rpc(
            "verifikasi_vendor_admin",
            {
                p_toko_id: item.id,
                p_status_verifikasi: statusBaru,
                p_alasan: alasanBaru
            }
        );

        if (error) {
            alert("Gagal mengubah verifikasi: " + error.message);
            return;
        }

        alert("Status verifikasi berhasil diubah.");
        window.tampilkanToko();
    }

    
    const tombolVerifikasi = document.createElement("button");
    tombolVerifikasi.textContent = "✓ Setujui Vendor";
    tombolVerifikasi.style.background = "#16a34a";
    tombolVerifikasi.style.color = "white";
    tombolVerifikasi.style.border = "none";
    tombolVerifikasi.style.borderRadius = "7px";
    tombolVerifikasi.style.padding = "10px 14px";
    tombolVerifikasi.style.margin = "5px";
    tombolVerifikasi.style.cursor = "pointer";
    tombolVerifikasi.onclick = () =>
        ubahVerifikasi("Terverifikasi");

    const tombolTolak = document.createElement("button");
    tombolTolak.textContent = "✕ Tolak Vendor";
    tombolTolak.style.background = "#dc2626";
    tombolTolak.style.color = "white";
    tombolTolak.style.border = "none";
    tombolTolak.style.borderRadius = "7px";
    tombolTolak.style.padding = "10px 14px";
    tombolTolak.style.margin = "5px";
    tombolTolak.style.cursor = "pointer";
    tombolTolak.onclick = () =>
        ubahVerifikasi("Ditolak");

    const tombolMenunggu = document.createElement("button");
    tombolMenunggu.textContent = "↻ Kembalikan Menunggu";
    tombolMenunggu.style.background = "#d97706";
    tombolMenunggu.style.color = "white";
    tombolMenunggu.style.border = "none";
    tombolMenunggu.style.borderRadius = "7px";
    tombolMenunggu.style.padding = "10px 14px";
    tombolMenunggu.style.margin = "5px";
    tombolMenunggu.style.cursor = "pointer";
    tombolMenunggu.onclick = () =>
        ubahVerifikasi("Menunggu");
    areaVerifikasi.append(
    tombolVerifikasi,
    tombolTolak,
    tombolMenunggu
);


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

        const { data: hasilUpdate, error } = await supabase
    .from("toko")
    .update({ status: statusBaru })
    .eq("id", item.id)
    .select("id, nama_toko, status");
    console.log("Data toko saat tambah produk:", toko);
    console.log("Hasil update toko:", hasilUpdate);
    console.log("Error update:", error);
    console.log("Status yang dikirim:", statusBaru);
    console.log("ID toko yang diubah:", item.id);

        if (error) {
            alert("Gagal mengubah status: " + error.message);
            tombolStatus.disabled = false;
            return;
        }

        alert("Status toko berhasil diubah.");
        tampilkanToko();
    });

    kartu.append(
    nama,
    deskripsi,
    pemilik,
    status,
    tombolStatus,
    areaVerifikasi
);
    daftar.appendChild(kartu);

    
});

    // Fungsi pencarian toko
    const inputCariToko = document.getElementById("cariToko");

    inputCariToko.addEventListener("input", () => {
        const kataKunci = inputCariToko.value.toLowerCase().trim();

        daftar.querySelectorAll(":scope > div").forEach(kartu => {
            kartu.style.display = kartu.textContent
                .toLowerCase()
                .includes(kataKunci) ? "" : "none";
        });
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

        const { data: daftarToko, error: errorToko } = await supabase
    .from("toko")
    .select("id, nama_toko");

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

    <input
        type="text"
        id="cariProduk"
        placeholder="Cari nama produk..."
        style="width:100%; padding:12px; margin:15px 0; border:1px solid #ddd; border-radius:8px;"
    >

    <select
        id="filterStatusProduk"
        style="width:100%; padding:12px; margin-bottom:15px; border:1px solid #ddd; border-radius:8px;"
    >
        <option value="semua">Semua Produk</option>
        <option value="aktif">Produk Aktif</option>
        <option value="nonaktif">Produk Nonaktif</option>
    </select>

    <div id="daftarProduk"></div>
`;


    const daftar = document.getElementById("daftarProduk");

    produk.forEach(item => {
        const foto = document.createElement("img");
foto.src = item.gambar_url || "";
foto.alt = item.nama || "Foto produk";
foto.style.width = "120px";
foto.style.height = "120px";
foto.style.objectFit = "cover";
foto.style.borderRadius = "12px";
foto.style.marginBottom = "12px";
foto.style.border = "1px solid #e2e8f0";

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

status.textContent = item.status_admin === "nonaktif"
    ? "Status Admin: Nonaktif"
    : "Status Admin: Aktif";

status.style.color = item.status_admin === "nonaktif"
    ? "#dc2626"
    : "#16a34a";

status.style.fontWeight = "bold";

const tombol = document.createElement("button");
const sedangAktif = item.status_admin !== "nonaktif";

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
                .update({ status_admin: statusBaru })
                .eq("id", item.id);

            if (error) {
                alert("Gagal mengubah status: " + error.message);
                tombol.disabled = false;
                return;
            }

            alert("Status produk berhasil diubah.");
            tampilkanProduk();
        });

        kartu.append(foto, nama, harga, toko, status, tombol);
        daftar.appendChild(kartu);
    });


    

    // Fungsi pencarian produk
    

    // Fungsi pencarian dan filter produk
    const inputCariProduk = document.getElementById("cariProduk");
    const filterStatusProduk = document.getElementById("filterStatusProduk");

    function terapkanFilterProduk() {
        const kataKunci = inputCariProduk.value.toLowerCase().trim();
        const statusDipilih = filterStatusProduk.value;

        daftar.querySelectorAll(":scope > div").forEach(kartu => {
            const teksKartu = kartu.textContent.toLowerCase();

            const cocokNama = teksKartu.includes(kataKunci);

            const cocokStatus =
                statusDipilih === "semua" ||
                (statusDipilih === "nonaktif"
                    ? teksKartu.includes("status admin: nonaktif")
                    : teksKartu.includes("status admin: aktif"));

            kartu.style.display =
                cocokNama && cocokStatus ? "" : "none";
        });
    }

    inputCariProduk.addEventListener("input", terapkanFilterProduk);
    filterStatusProduk.addEventListener("change", terapkanFilterProduk);



    inputCariProduk.addEventListener("input", () => {
        const kataKunci = inputCariProduk.value.toLowerCase().trim();

        daftar.querySelectorAll(":scope > div").forEach(kartu => {
            kartu.style.display = kartu.textContent
                .toLowerCase()
                .includes(kataKunci) ? "" : "none";
        });
    });

};

btnToko.addEventListener("click", () => {
    aturMenuAktif(btnToko);
    tampilkanToko();
});

btnProduk.addEventListener("click", () => {
    aturMenuAktif(btnProduk);
    tampilkanProduk();
});
btnPesanan.addEventListener("click", () => {
    aturMenuAktif(btnPesanan);
    tampilkanPesanan();
});
btnMenuToko.addEventListener("click", tampilkanToko);
btnMenuProduk.addEventListener("click", tampilkanProduk);


btnDashboard.addEventListener("click", async () => {
    aturMenuAktif(btnDashboard);

    areaAdmin.innerHTML = `
        <h3>Dashboard Admin</h3>
        <p>Selamat datang di pengelolaan Pasar Nganjuk Online.</p>
    `;

    await muatStatistikAdmin();
});


async function tampilkanPesanan() {
    areaAdmin.innerHTML = `
        <h3>Daftar Pesanan</h3>
        <p>Memuat data pesanan...</p>
    `;

    const { data: pesanan, error } = await supabase
        .from("pesanan")
        .select("*")
        .order("created_at", { ascending: false });
        const { data: semuaItem, error: errorItem } = await supabase
    .from("item_pesanan")
    .select("*");

if (errorItem) {
    areaAdmin.innerHTML = `
        <h3>Daftar Pesanan</h3>
        <p>Gagal memuat detail barang: ${errorItem.message}</p>
    `;
    return;
}

    if (error) {
        areaAdmin.innerHTML = `
            <h3>Daftar Pesanan</h3>
            <p>Gagal memuat pesanan: ${error.message}</p>
        `;
        return;
    }

    if (!pesanan || pesanan.length === 0) {
        areaAdmin.innerHTML = `
            <h3>Daftar Pesanan</h3>
            <p>Belum ada pesanan.</p>
        `;
        return;
    }

   areaAdmin.innerHTML = `
    <h3>Ringkasan Pesanan</h3>

    <div class="admin-stats">
        <div class="admin-stat-card">
            <p>Menunggu</p>
            <h2>${pesanan.filter(p => p.status === "Menunggu").length}</h2>
        </div>

        <div class="admin-stat-card">
            <p>Diproses</p>
            <h2>${pesanan.filter(p => p.status === "Diproses").length}</h2>
        </div>

        <div class="admin-stat-card">
            <p>Siap Dikirim</p>
            <h2>${pesanan.filter(p => p.status === "Siap dikirim").length}</h2>
        </div>

        <div class="admin-stat-card">
            <p>Selesai</p>
            <h2>${pesanan.filter(p => p.status === "Selesai").length}</h2>
        </div>

        <div class="admin-stat-card">
            <p>Dibatalkan</p>
            <h2>${pesanan.filter(p => p.status === "Dibatalkan").length}</h2>
        </div>
    </div>

    <h3>Daftar Pesanan (${pesanan.length})</h3>

    <select
        id="filterStatusPesanan"
        style="width:100%; padding:13px; margin:15px 0; border:1px solid #ddd; border-radius:9px;"
    >
        <option value="semua">Semua Pesanan</option>
        <option value="Menunggu">Menunggu</option>
        <option value="Diproses">Diproses</option>
        <option value="Siap dikirim">Siap dikirim</option>
        <option value="Selesai">Selesai</option>
        <option value="Dibatalkan">Dibatalkan</option>
    </select>

    <div id="daftarPesanan"></div>
`;

    const daftar = document.getElementById("daftarPesanan");
    const filterStatus = document.getElementById("filterStatusPesanan");

filterStatus.addEventListener("change", () => {
    const statusDipilih = filterStatus.value;

    daftar.querySelectorAll(":scope > div").forEach(kartu => {
        const statusKartu = kartu.dataset.status;

        kartu.style.display =
            statusDipilih === "semua" || statusKartu === statusDipilih
                ? ""
                : "none";
    });
});

    pesanan.forEach(item => {
       
        const kartu = document.createElement("div");
        kartu.dataset.status = item.status || "";
        let kelasStatus = "status-menunggu";

if (item.status === "Diproses") {
    kelasStatus = "status-diproses";
} else if (item.status === "Siap dikirim") {
    kelasStatus = "status-siap";
} else if (item.status === "Selesai") {
    kelasStatus = "status-selesai";
} else if (item.status === "Dibatalkan") {
    kelasStatus = "status-dibatalkan";
}
        const itemPesanan = semuaItem.filter(barang =>
    barang.pesanan_id === item.id
);

const daftarBarang = itemPesanan.map(barang => `
    <li>
        ${barang.nama_produk || "Produk"}
        — ${barang.jumlah} × Rp ${Number(barang.harga || 0).toLocaleString("id-ID")}
        <br>
        Toko: ${barang.nama_toko || "-"}
    </li>
`).join("");

        kartu.style.border = "1px solid #ddd";
        kartu.style.padding = "15px";
        kartu.style.margin = "10px 0";
        kartu.style.borderRadius = "10px";

        kartu.innerHTML = `
            <h4>Pesanan: ${item.kode_pesanan || "-"}</h4>
            <p>Nama Pembeli: ${item.nama_pembeli || "-"}</p>
            <p>WhatsApp: ${item.whatsapp || "-"}</p>
            <p>Kecamatan: ${item.kecamatan || "-"}</p>
            <p>Total: Rp ${Number(item.total || 0).toLocaleString("id-ID")}</p>
            <p>
    Status Saat Ini:
    <span class="${kelasStatus}" style="padding:5px 10px; border-radius:20px; font-weight:bold;">
        ${item.status || "-"}
    </span>
</p>
            <label>Ubah Status:</label>

<select id="statusPesanan-${item.id}" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">
    <option value="Menunggu" ${item.status === "Menunggu" ? "selected" : ""}>Menunggu</option>
    <option value="Diproses" ${item.status === "Diproses" ? "selected" : ""}>Diproses</option>
    <option value="Siap dikirim" ${item.status === "Siap dikirim" ? "selected" : ""}>Siap dikirim</option>
    <option value="Selesai" ${item.status === "Selesai" ? "selected" : ""}>Selesai</option>
    <option value="Dibatalkan" ${item.status === "Dibatalkan" ? "selected" : ""}>Dibatalkan</option>
</select>

<button id="simpanStatus-${item.id}" style="background:#0875cc;">
    Simpan Status
</button>
            <p><strong>Detail Barang:</strong></p>
<ul>
    ${daftarBarang || "<li>Tidak ada detail barang</li>"}
</ul>
            <p>Tanggal: ${new Date(item.created_at).toLocaleString("id-ID")}</p>
        `;

        daftar.appendChild(kartu);
        const pilihanStatus = document.getElementById(`statusPesanan-${item.id}`);
const tombolSimpan = document.getElementById(`simpanStatus-${item.id}`);

tombolSimpan.addEventListener("click", async () => {
    const statusBaru = pilihanStatus.value;

    if (!confirm(`Ubah status pesanan ${item.kode_pesanan} menjadi ${statusBaru}?`)) {
        return;
    }

    tombolSimpan.disabled = true;
    tombolSimpan.textContent = "Menyimpan...";

    const { data, error } = await supabase.rpc(
        "ubah_status_pesanan_admin",
        {
            p_pesanan_id: item.id,
            p_status: statusBaru
        }
    );

    if (error) {
        alert("Gagal mengubah status: " + error.message);
        tombolSimpan.disabled = false;
        tombolSimpan.textContent = "Simpan Status";
        return;
    }

    alert("Status pesanan berhasil diperbarui!");
    tampilkanPesanan();
});
    });
}

// Mengatur menu sidebar yang sedang aktif
function aturMenuAktif(tombolAktif) {
    document.querySelectorAll(".admin-nav button").forEach(tombol => {
        tombol.classList.remove("active");
    });

    tombolAktif.classList.add("active");
}


periksaAdmin();
supabase.auth.getUser().then(({ data, error }) => {
    console.log("User login:", data.user?.id);
    console.log("Error:", error);
});