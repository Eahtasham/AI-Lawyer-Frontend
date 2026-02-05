# AI Lawyer Frontend

This is the frontend application for the AI Lawyer platform, providing a sophisticated chat interface for legal assistance, powered by advanced AI.

## Features

### 🧠 Intelligent Chat Interface
- **Real-time Streaming**: Experience token-by-token streaming responses for immediate feedback.
- **Markdown Support**: Rich text rendering for statutes, cases, and legal formatting.
- **Context Awareness**: Maintains conversation history for coherent follow-up questions.

### ⚡ Chat Modes
Tailor the AI's research depth to your needs:
- **⚡ Fast Mode**: Quick answers querying only statute resources. Ideal for rapid fact-checking.
- **⚖️ Balanced Mode**: Queries statutes and incorporates **Council Opinions** for a well-rounded legal perspective.
- **📖 Research Mode** (Default): The full power of the AI. Queries **Statutes** and **Case Law**, along with **Council Opinions**, providing the most comprehensive legal analysis.

### 🗂️ Session Management
- **History**: Access previous conversations easily.
- **Organization**: Rename, Pin, and Delete chat sessions to keep your workspace tidy.
- **Persistence**: chat history is safely stored in Supabase.

### 🔐 Authentication
- Secure user authentication and profile management via **Supabase**.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Create a `.env` file with the following:
    ```env
    NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Icons**: Lucide React
- **Auth/DB**: Supabase

## Learn More
To learn more about the technologies used:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
