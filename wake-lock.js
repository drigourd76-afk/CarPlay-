
(() => {
  "use strict";

  let wakeLock = null;
  let actif = true;
  let demandeEnCours = false;

  function statut(message) {
    console.log("[Écran]", message);

    const element =
      document.getElementById("etatEcran");

    if (element) {
      element.textContent = message;
    }
  }

  async function activer() {
    if (!actif || demandeEnCours ||
        document.visibilityState !== "visible") {
      return;
    }

    if (!("wakeLock" in navigator)) {
      statut("Non compatible");
      return;
    }

    if (wakeLock && !wakeLock.released) {
      return;
    }

    demandeEnCours = true;

    try {
      const verrou =
        await navigator.wakeLock.request("screen");

      if (!actif) {
        await verrou.release();
        return;
      }

      wakeLock = verrou;
      statut("Écran maintenu allumé");

      verrou.addEventListener("release", () => {
        if (wakeLock === verrou) {
          wakeLock = null;
        }
        statut("Maintien interrompu");
      });

    } catch (erreur) {
      statut("Refus iOS : " + erreur.name);
    } finally {
      demandeEnCours = false;
    }
  }

  async function desactiver() {
    actif = false;

    if (wakeLock) {
      const verrou = wakeLock;
      wakeLock = null;
      await verrou.release();
    }

    statut("Maintien désactivé");
  }

  window.controleEcran = {
    activer: () => {
      actif = true;
      return activer();
    },
    desactiver
  };

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "visible") {
        activer();
      }
    }
  );

  window.addEventListener("pageshow", activer);

  activer();
})();
