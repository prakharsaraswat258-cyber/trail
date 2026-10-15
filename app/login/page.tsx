import { redirect } from 'next/navigation';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const target = searchParams?.redirect || '/browse';
  redirect(target);
}
