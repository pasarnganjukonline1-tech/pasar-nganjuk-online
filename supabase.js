
const SUPABASE_URL = "https://jpszngdjpsgjbxchurzi.supabase.co";

const SUPABASE_KEY = "sb_publishable_sRfnpBpuz4fRqoC37kzVyA_tLS6a0Gj";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// FUNGSI LOGOUT
document.addEventListener("DOMContentLoaded", function () {
    const tombolLogout = document.getElementById("tombolLogout");

    if (!tombolLogout) return;

    tombolLogout.addEventListener("click", async function () {
        const yakin = confirm("Apakah Anda yakin ingin keluar dari akun?");

        if (!yakin) return;

        tombolLogout.disabled = true;
        tombolLogout.textContent = "Memproses...";

        try {
            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            alert("Anda berhasil keluar dari akun.");

            window.location.href = "index.html";

        } catch (error) {
            console.error("Gagal logout:", error);

            alert("Gagal keluar dari akun. Silakan coba lagi.");

            tombolLogout.disabled = false;
            tombolLogout.textContent = "🚪 Keluar";
        }
    });
});


// ATUR MENU AKUN BERDASARKAN STATUS LOGIN
document.addEventListener("DOMContentLoaded", async function () {
    const menuBelumLogin = document.getElementById("menuSaatBelumLogin");
    const menuSudahLogin = document.getElementById("menuSaatLogin");

    if (!menuBelumLogin || !menuSudahLogin) {
        console.error("Elemen menu akun tidak ditemukan.");
        return;
    }

    function aturMenuAkun(session) {
        const sudahLogin = !!session;

        menuBelumLogin.hidden = sudahLogin;
        menuSudahLogin.hidden = !sudahLogin;
    }

    // Periksa status login saat halaman dibuka
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Gagal memeriksa sesi:", error);
        return;
    }

    aturMenuAkun(data.session);

    // Pantau perubahan status login dan logout
    supabaseClient.auth.onAuthStateChange(function (event, session) {
        aturMenuAkun(session);
    });
});
