import { useRouter } from 'next/router';
import { useEffect, useState, FormEvent, useRef } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Conversation } from '../mon-compte'; // Import Conversation type

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  // Potentially add sender_name or profile info later
}

const ConversationPage = () => {
  const router = useRouter();
  const { id: conversationId } = router.query; // Get conversation ID from URL
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch conversation details
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('Error fetching conversation:', convError);
        // Handle case where conversation doesn't exist or user doesn't have access
        router.push('/mon-compte'); // Redirect back to account page
        return;
      }
      setConversation(convData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setMessages(messagesData);
      }
      setLoading(false);
    };

    fetchConversationData();
  }, [conversationId, router, supabase]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation_${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message.');
    } else {
      setNewMessage(''); // Clear input after sending
    }
    setSending(false);
  };

  if (loading) {
    return (
      <>
        <Head><title>Chargement conversation...</title></Head>
        <Header />
        <main className="container" style={{paddingTop: '4rem', textAlign: 'center'}}>
          <p>Chargement de la conversation...</p>
        </main>
      </>
    );
  }

  if (!conversation) {
    return (
      <>
        <Head><title>Conversation introuvable</title></Head>
        <Header />
        <main className="container" style={{paddingTop: '4rem', textAlign: 'center'}}>
          <p>Conversation introuvable ou accès non autorisé.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Conversation #{conversation.id} | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{paddingTop: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)'}}>
        <h1 style={{textAlign: 'center', marginBottom: '1rem'}}>Conversation #{conversation.id}</h1>
        {conversation.order_id && (
            <p style={{textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
                Liée à la commande <Link href={`/mon-compte`} style={{textDecoration: 'underline'}}>#{conversation.order_id}</Link>
            </p>
        )}

        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <p style={{textAlign: 'center', color: '#888'}}>Aucun message dans cette conversation.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ ...styles.messageBubble, ...(msg.sender_id === user?.id ? styles.myMessage : styles.otherMessage) }}>
                <p style={styles.messageContent}>{msg.content}</p>
                <span style={styles.messageTime}>{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} /> {/* Scroll target */}
        </div>

        <form onSubmit={handleSendMessage} style={styles.messageInputContainer}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            style={styles.messageInput}
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" style={styles.sendButton} disabled={sending}>
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </main>
    </>
  );
};

const styles = {
  messagesContainer: {
    flexGrow: 1,
    overflowY: 'auto' as 'auto',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '0.5rem',
    backgroundColor: '#f9f9f9',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '0.75rem 1rem',
    borderRadius: '1.2rem',
    position: 'relative' as 'relative',
    wordWrap: 'break-word' as 'break-word',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    color: 'white',
    borderBottomRightRadius: '0.3rem',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e6ea',
    color: '#333',
    borderBottomLeftRadius: '0.3rem',
  },
  messageContent: {
    margin: 0,
    fontSize: '0.95rem',
  },
  messageTime: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '0.2rem',
    display: 'block',
    textAlign: 'right' as 'right',
  },
  messageInputContainer: {
    display: 'flex',
    padding: '1rem 0',
    borderTop: '1px solid #eee',
    backgroundColor: 'white',
  },
  messageInput: {
    flexGrow: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '20px',
    marginRight: '0.5rem',
    fontSize: '1rem',
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '20px',
    fontSize: '1rem',
  },
};

export default ConversationPage;
