import { environment } from '../environments/environment';
import { applyColorScale, generateColorScale } from './shared/helpers/color.helper';

export function appInitializerFactory(): () => void {
  return () => {
    applyColorScale('primary',   generateColorScale(environment.primaryColor));
    applyColorScale('secondary', generateColorScale(environment.secondaryColor));
  };
}
