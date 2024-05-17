interface AppAvatarProps {
  imageSrc: string;
}

const AppAvatar = ({ imageSrc }: AppAvatarProps) => {
  return (
    <div className="relative inline-block">
      {/* Not using next image because of dynamic domains */}
      <img
        src={imageSrc}
        alt="App Avatar"
        width={40}
        height={40}
        className="rounded-full border-[1px] border-gray-300 shadow-md p-1"
      />
      <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
    </div>
  );
};

export default AppAvatar;
