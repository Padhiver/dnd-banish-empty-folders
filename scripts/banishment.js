// dnd-banish-empty-folders.js - Compatible with Foundry VTT v12 and v13
Hooks.once("init", () => {
  // Enregistrement des paramètres du module
  game.settings.register("dnd-banish-empty-folders", "enabled", {
    name: game.i18n.localize("BEFSettingsEnableHidingName"),
    hint: game.i18n.localize("BEFSettingsEnableHidingHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true // À supprimer pour la v13 uniquement
  });

  game.settings.register("dnd-banish-empty-folders", "hideSRDCompendium", {
    name: game.i18n.localize("BEFSettingsHideSRDCompendiumName"),
    hint: game.i18n.localize("BEFSettingsHideSRDCompendiumHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true // À supprimer pour la v13 uniquement
  });
});

/**
 * Vérifie récursivement si un dossier est vide
 * @param {HTMLElement} folder - Élément DOM du dossier à vérifier
 * @returns {boolean} - true si le dossier est vide, false sinon
 */
function isFolderEmpty(folder) {
  const subdirectory = folder.querySelector('ol.subdirectory');
  
  // Si pas de sous-dossier ou sous-dossier vide
  if (!subdirectory || subdirectory.children.length === 0) return true;
  
  // Vérifier chaque enfant
  for (const child of subdirectory.children) {
    // Si un élément n'est pas un dossier, le dossier parent n'est pas vide
    if (!child.classList.contains('folder')) return false;
    
    // Si un sous-dossier n'est pas vide, le dossier parent n'est pas vide
    if (!isFolderEmpty(child)) return false;
  }
  
  // Tous les enfants sont des dossiers vides
  return true;
}

/**
 * Cache les dossiers vides dans l'élément spécifié
 * @param {HTMLElement|JQuery} html - Élément DOM ou objet jQuery contenant les dossiers
 */
function hideEmptyFolders(html) {
  if (!game.settings.get('dnd-banish-empty-folders', 'enabled')) return;
  
  // Normaliser l'entrée en élément DOM
  const element = html[0] || html;
  if (!element) return;
  
  console.log("Hide Empty Compendium Folders | Checking folders");
  
  const folders = element.querySelectorAll('.directory-item.folder');
  folders.forEach(folder => {
    if (isFolderEmpty(folder)) {
      const folderName = folder.querySelector('.folder-name, h3')?.textContent.trim() || "Unnamed folder";
      console.log(`Empty folder found and hidden: ${folderName}`);
      folder.style.display = 'none';
    }
  });
}

/**
 * Cache les dossiers SRD selon la version de Foundry
 * @param {HTMLElement|JQuery} html - Élément DOM ou objet jQuery à traiter
 */
function hideSRDContent(html) {
  if (!game.settings.get('dnd-banish-empty-folders', 'hideSRDCompendium')) return;
  
  const element = html[0] || html;
  if (!element) return;
  
  const srdFolderName = game.i18n.localize("BEFFoldersSRDContent");
  
  // Méthode compatible v12 et v13
  // Recherche les dossiers par leur nom affiché
  const folderSelectors = [
    '.folder-name', // v13
    'h3.noborder'   // v12
  ];
  
  folderSelectors.forEach(selector => {
    const nameElements = element.querySelectorAll(selector);
    nameElements.forEach(nameEl => {
      if (nameEl.textContent.trim() === srdFolderName) {
        const folder = nameEl.closest('.directory-item.folder, .folder');
        if (folder) {
          console.log(`SRD folder found and hidden: ${srdFolderName}`);
          // Utiliser remove() pour v13 et display:none pour v12 pour garantir la compatibilité
          if (game.version && parseFloat(game.version) >= 13) {
            folder.remove();
          } else {
            folder.style.display = 'none';
          }
        }
      }
    });
  });
}

// Hook pour le rendu du répertoire de compendium
Hooks.on("renderCompendiumDirectory", (app, html) => {
  hideEmptyFolders(html);
  hideSRDContent(html);
});

// Initialisation du module
Hooks.once("ready", () => {
  console.log("Module Hide Empty Compendium Folders | Initialized");
  
  // Délai pour s'assurer que l'interface est complètement chargée
  // Nécessaire principalement pour v12, peut être retiré dans v13
  setTimeout(() => {
    const compendiumSidebar = document.querySelector('.compendium-sidebar');
    if (compendiumSidebar) {
      hideEmptyFolders(compendiumSidebar);
      hideSRDContent(compendiumSidebar);
    }
  }, 500); // Réduit à 500ms au lieu de 1000ms pour améliorer la réactivité
});