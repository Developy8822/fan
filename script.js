const canvas = document.getElementById("topography");
const ctx = canvas.getContext("2d");

let width;
let height;

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

const settings = {
    lines: 85,
    spacing: 13,
    amplitude: 65,
    frequency: 0.004,
    speed: 0.00015,
    color: "rgba(120,120,120,0.10)"
};

function noise(x, y, time) {
    return (
        Math.sin(x * settings.frequency + time) *
        Math.cos(y * 0.008 + time * 0.5) +
        Math.sin(
            x * 0.002 +
            y * 0.004 +
            time * 0.3
        )
    );
}

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

function draw(time) {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = settings.color;
    ctx.lineWidth = 1;

    const t = time * settings.speed;

    for (let i = 0; i < settings.lines; i++) {
        ctx.beginPath();

        const baseY =
            height / 2 +
            (i - settings.lines / 2) *
            settings.spacing;

        for (let x = -50; x <= width + 50; x += 5) {
            const y =
                baseY +
                noise(x, baseY, t) *
                settings.amplitude;

            if (x === -50) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    if (!reduceMotion) {
        requestAnimationFrame(draw);
    }
}

requestAnimationFrame(draw);

const statusModal = document.getElementById("statusModal");
const scriptModal = document.getElementById("scriptModal");
const getScriptButton = document.getElementById("getScriptButton");
const statusButton = document.getElementById("statusButton");

let activeModal = null;
let previousFocus = null;

function openModal(modal) {
    if (activeModal) {
        closeModal();
    }

    previousFocus = document.activeElement;
    activeModal = modal;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    modal.querySelector(".modal-close").focus();
}

function closeModal() {
    if (!activeModal) return;

    activeModal.classList.remove("active");
    activeModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    activeModal = null;

    if (
        previousFocus &&
        typeof previousFocus.focus === "function"
    ) {
        previousFocus.focus();
    }
}

getScriptButton.addEventListener("click", () => {
    openModal(scriptModal);
});

statusButton.addEventListener("click", () => {
    openModal(statusModal);
});

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", closeModal);
});

document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });
});

document.addEventListener("keydown", event => {
    if (!activeModal) return;

    if (event.key === "Escape") {
        closeModal();
    }

    if (event.key === "Tab") {
        const buttons = [
            ...activeModal.querySelectorAll("button")
        ];

        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }
});

const copyButton = document.getElementById("copyButton");
const scriptText = document.getElementById("scriptText");

copyButton.addEventListener("click", async () => {
    const text = scriptText.textContent.trim();

    try {
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement("textarea");

            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);
            textarea.select();

            const success = document.execCommand("copy");
            textarea.remove();

            if (!success) {
                throw new Error("Copy failed");
            }
        }

        copyButton.classList.add("copied");
        copyButton.innerHTML =
            '<i class="fa-solid fa-check"></i>';

        setTimeout(() => {
            copyButton.classList.remove("copied");
            copyButton.innerHTML =
                '<i class="fa-regular fa-copy"></i>';
        }, 2000);

    } catch (error) {
        console.error("Failed to copy script:", error);
    }
});
