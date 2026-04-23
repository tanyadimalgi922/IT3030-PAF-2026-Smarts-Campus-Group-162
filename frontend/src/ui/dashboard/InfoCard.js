function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-campus-pale p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-black text-campus-navy">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default InfoCard;
