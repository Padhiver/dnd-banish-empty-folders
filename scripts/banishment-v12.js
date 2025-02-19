// dnd-banish-empty-folders.js
Hooks.once("init", () => {
  game.settings.register("dnd-banish-empty-folders", "enabled", {
    name: game.i18n.localize("BEFSettingsEnableHidingName"),
    hint: game.i18n.localize("BEFSettingsEnableHidingHint"),
    scope: "world",
    config: true,
    type: Boolean,
    requiresReload: true,
    default: true
  });

  game.settings.register("dnd-banish-empty-folders", "hideSRDCompendium", {
    name: game.i18n.localize("BEFSettingsHideSRDCompendiumName"),
    hint: game.i18n.localize("BEFSettingsHideSRDCompendiumHint"),
    scope: "world",
    config: true,
    type: Boolean,
    requiresReload: true,
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
  
  console.log("Hide Empty Compendium Folders | Checking folders");
  
  const folders = element.querySelectorAll('.directory-item.folder');
  
  folders.forEach(folder => {
    if (isFolderEmpty(folder)) {
      const folderName = folder.querySelector('h3')?.textContent.trim() || "Unnamed folder";
      console.log(`Empty folder found and hidden: ${folderName}`);
      folder.style.display = 'none';
    }
  });
}

// Gestion des compendiums SRD
function hideSRDCompendiums(html) {
  if (game.settings.get('dnd-banish-empty-folders', 'hideSRDCompendium')) {
    const folders = [
      game.i18n.localize("BEFFoldersSRDContent")
    ];
    const elements = html.querySelectorAll(`.compendium-sidebar .folder:has(h3.noborder)`);
    for (const element of elements) {
      folders.forEach((folder) => {
        if (element.querySelector('h3.noborder').textContent === folder) {
          element.remove();
        }
      });
    }
  }
}

// Appliquer la vérification lors du rendu du compendium
Hooks.on("renderCompendiumDirectory", (app, html) => {
  const element = html[0] || html;
  hideEmptyFolders(element);
  hideSRDCompendiums(element);
});

// Appliquer la vérification après le chargement initial
Hooks.once("ready", () => {
  console.log("Module Hide Empty Compendium Folders | Initialized");
  
  // Attendre un peu pour que l'interface soit complètement chargée
  setTimeout(() => {
    const compendiumSidebar = document.querySelector('.compendium-sidebar');
    if (compendiumSidebar) {
      hideEmptyFolders(compendiumSidebar);
      hideSRDCompendiums(compendiumSidebar);
    }
  }, 1000);
});