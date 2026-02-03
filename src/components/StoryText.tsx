export function StoryText({
  text = "The dungeon awaits your command..."
}) {
  return (
    <section className="border-2 border-white p-4 min-h-[240px]">
      <p className="leading-7 whitespace-pre-line">
        {text}
      </p>
    </section>
  );
}
