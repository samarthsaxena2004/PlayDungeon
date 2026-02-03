export function ChoiceButtons() {
  const mock = [
    "Enter the shadows",
    "Open the door",
    "Follow the glow",
  ];

  return (
    <div className="grid gap-2 mt-4">
      {mock.map((c) => (
        <button
          key={c}
          className="
            border-2 border-white p-2 
            hover:bg-white hover:text-black 
            transition
          "
        >
          {c}
        </button>
      ))}
    </div>
  );
}
