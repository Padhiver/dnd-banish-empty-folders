// dnd-banish-empty-folders.js (v13)
Hooks.once("init", () => {
  game.settings.register("dnd-banish-empty-folders", "enabled", {
    name: game.i18n.localize("BEFSettingsEnableHidingName"),
    hint: game.i18n.localize("BEFSettingsEnableHidingHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("dnd-banish-empty-folders", "hideSRDCompendium", {
    name: game.i18n.localize("BEFSettingsHideSRDCompendiumName"),
    hint: game.i18n.localize("BEFSettingsHideSRDCompendiumHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
});

// Fonction pour vérifier récursivement si un dossier est vide
function isFolderEmpty(folder) {
  const subdirectory = folder.querySelector('ol.subdirectory');
  if (!subdirectory || subdirectory.children.length === 0) return true;

  let allChildrenEmpty = true;
  for (const child of subdirectory.children) {
    if (!child.classList.contains('folder')) {
      return false;
    }
    if (!isFolderEmpty(child)) {
      return false;
    }
  }
  return allChildrenEmpty;
}

// Fonction principale pour cacher les dossiers vides
function hideEmptyFolders(element) {
  if (!game.settings.get('dnd-banish-empty-folders', 'enabled')) return;

  const folders = element.querySelectorAll('.directory-item.folder');
  folders.forEach(folder => {
    if (isFolderEmpty(folder)) {
      folder.style.display = 'none';
    }
  });
}

// Fonction pour gérer les compendiums SRD
function hideSRDFolders(html) {
  if (game.settings.get('dnd-banish-empty-folders', 'hideSRDCompendium')) {
    const srdFolderName = game.i18n.localize("BEFFoldersSRDContent");
    const srdFolders = html.querySelectorAll(`.directory-item.folder .folder-name`);
    srdFolders.forEach((folderNameElement) => {
      if (folderNameElement.textContent.trim() === srdFolderName) {
        const folder = folderNameElement.closest('.directory-item.folder');
        if (folder) {
          folder.remove();
        }
      }
    });
  }
}

// Hook pour cacher les dossiers vides lors du rendu du compendium
Hooks.on("renderCompendiumDirectory", (app, html) => {
  hideEmptyFolders(html);
  hideSRDFolders(html);
});

// Vérification initiale lorsque le module est prêt
Hooks.once("ready", () => {
  console.log("Module Hide Empty Compendium Folders | Initialized");
  if (ui.compendium) {
    hideEmptyFolders(document.querySelector('.compendium-sidebar'));
  }
});
