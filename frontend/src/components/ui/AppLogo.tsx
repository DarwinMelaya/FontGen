import { useTheme } from "../../context/ThemeContext";

const LOGO_PATHS = {
  dark: "/img/logo darkmode.png",
  light: "/img/logo lightmode.png",
} as const;

type AppLogoProps = {
  className?: string;
  alt?: string;
};

const AppLogo = ({
  className = "h-16 w-auto",
  alt = "Pubmat Font Generator",
}: AppLogoProps) => {
  const { theme } = useTheme();

  return (
    <img
      src={LOGO_PATHS[theme]}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
};

export default AppLogo;
