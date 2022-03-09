window.global = window;
(function () {
  var themeKey = 'dark-mode';
  var darkClassname = 'dark';
  var lightClassname = 'light';

  function addThemeClassToDocumentBody(darkMode) {
    document.documentElement.classList.add(
      darkMode ? darkClassname : lightClassname
    );

    document.documentElement.classList.remove(
      darkMode ? lightClassname : darkClassname
    );
  }

  var preferDarkQuery = '(prefers-color-scheme: dark)';
  var mql = window.matchMedia(preferDarkQuery);
  var supportsColorSchemeQuery = mql.media === preferDarkQuery;
  var localStorageTheme = null;
  try {
    localStorageTheme = localStorage.getItem(themeKey);
  } catch {}
  var themeExists = localStorageTheme !== null;
  if (themeExists) {
    localStorageTheme = JSON.parse(localStorageTheme);
  }

  if (themeExists) {
    addThemeClassToDocumentBody(localStorageTheme);
  } else if (supportsColorSchemeQuery) {
    addThemeClassToDocumentBody(mql.matches);
    localStorage.setItem(themeKey, mql.matches);
  } else {
    var isDarkMode = document.documentElement.classList.contains(darkClassname);
    localStorage.setItem(themeKey, JSON.stringify(isDarkMode));
  }
})();
