function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-campus-violet">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-black text-campus-navy">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default InfoCard;
