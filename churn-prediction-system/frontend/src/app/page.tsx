import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect the root URL straight to our Churn Prediction Dashboard
  redirect('/dashboard');
}
