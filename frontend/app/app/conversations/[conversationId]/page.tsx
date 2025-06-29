import { redirect } from 'next/navigation';

interface ChatPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params;
  
  // Redirect to the new single-page conversations with query parameter
  redirect(`/app/conversations?id=${conversationId}`);
}