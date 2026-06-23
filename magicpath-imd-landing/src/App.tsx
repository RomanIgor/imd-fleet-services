import { Theme } from './settings/types';
import { IMDFleetSaaSLanding } from './components/generated/IMDFleetSaaSLanding';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return (
    <>
      <IMDFleetSaaSLanding />
    </>);
  // %EXPORT_STATEMENT%
}

export default App;