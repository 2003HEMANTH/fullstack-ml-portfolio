export default function ApiErrorNotice({ message }: { message: string }) {
  if (!message) return null;
  return <p role="alert" className="mx-auto my-4 max-w-7xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">{message}</p>;
}
