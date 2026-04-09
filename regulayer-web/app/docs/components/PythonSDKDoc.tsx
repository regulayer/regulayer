"use client";
import React from "react";

const CodeBlock = ({ children, lang }: { children: string; lang?: string }) => (
  <div className="relative group">
    <pre className="bg-white border border-slate-200 p-4 rounded-lg overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

const InlineCode = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-slate-100/80 text-slate-600 px-1.5 py-0.5 rounded text-[0.85em] font-mono">{children}</code>
);

const MethodCard = ({ name, sig, desc, params, returns, example }: {
  name: string; sig: string; desc: string;
  params: { name: string; type: string; desc: string; optional?: boolean }[];
  returns: string; example: string;
}) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
    <div className="bg-white/80 px-5 py-3 border-b border-slate-200">
      <code className="text-slate-500 font-mono text-sm font-bold">{sig}</code>
    </div>
    <div className="p-5 space-y-4">
      <p className="text-slate-600 text-sm">{desc}</p>
      {params.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Parameters</h4>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-800/50">
              {params.map(p => (
                <tr key={p.name}>
                  <td className="py-1.5 pr-3 whitespace-nowrap"><code className="text-cyan-400 text-xs">{p.name}</code></td>
                  <td className="py-1.5 pr-3 whitespace-nowrap text-xs text-slate-500 font-mono">{p.type}</td>
                  <td className="py-1.5 text-xs text-slate-500">{p.desc} {p.optional && <span className="text-slate-600">(optional)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Returns</h4>
        <p className="text-xs text-slate-500 font-mono">{returns}</p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Example</h4>
        <CodeBlock>{example}</CodeBlock>
      </div>
    </div>
  </div>
);

export default function PythonSDKDoc() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Python SDK Reference</h1>
      <p className="text-lg text-slate-500 mb-8">The official Python SDK for recording, tracing, and governing AI decisions with Regulayer. Compatible with Python 3.8+.</p>

      {/* Installation */}
      <h2>Installation</h2>
      <p>Install the SDK from PyPI:</p>
      <CodeBlock>pip install regulayer</CodeBlock>
      <p className="text-sm text-slate-500 mt-2">Or with optional dependencies for async support:</p>
      <CodeBlock>pip install regulayer[async]</CodeBlock>

      {/* Configuration */}
      <h2 className="mt-10">Configuration</h2>
      <p>The SDK supports configuration via constructor arguments or environment variables. Environment variables are checked automatically if constructor arguments are not provided.</p>
      <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden my-4">
        <thead><tr className="bg-white/80 border-b border-slate-200">
          <th className="py-2 px-4 text-left text-xs uppercase text-slate-500 font-bold">Env Variable</th>
          <th className="py-2 px-4 text-left text-xs uppercase text-slate-500 font-bold">Constructor Arg</th>
          <th className="py-2 px-4 text-left text-xs uppercase text-slate-500 font-bold">Description</th>
        </tr></thead>
        <tbody className="divide-y divide-zinc-800/50">
          <tr><td className="py-2 px-4 font-mono text-xs text-cyan-400">REGULAYER_API_KEY</td><td className="py-2 px-4 font-mono text-xs text-slate-600">api_key</td><td className="py-2 px-4 text-xs text-slate-500">Your project API key (required)</td></tr>
          <tr><td className="py-2 px-4 font-mono text-xs text-cyan-400">REGULAYER_PROJECT_ID</td><td className="py-2 px-4 font-mono text-xs text-slate-600">project_id</td><td className="py-2 px-4 text-xs text-slate-500">Project UUID for scoping decisions</td></tr>
          <tr><td className="py-2 px-4 font-mono text-xs text-cyan-400">REGULAYER_ENDPOINT</td><td className="py-2 px-4 font-mono text-xs text-slate-600">endpoint</td><td className="py-2 px-4 text-xs text-slate-500">API endpoint (default: https://api.regulayer.tech)</td></tr>
          <tr><td className="py-2 px-4 font-mono text-xs text-cyan-400">REGULAYER_ENVIRONMENT</td><td className="py-2 px-4 font-mono text-xs text-slate-600">environment</td><td className="py-2 px-4 text-xs text-slate-500">Environment tag: &quot;production&quot;, &quot;staging&quot;, &quot;development&quot;</td></tr>
        </tbody>
      </table>

      {/* Client Initialization */}
      <h2 className="mt-10">Client Initialization</h2>
      <p>Import and create a client instance. The client manages authentication, payload hashing, and HTTP transport.</p>
      <CodeBlock>{`from regulayer import Regulayer

# Option 1: Explicit configuration
client = Regulayer(
  api_key="rl_live_abc123...",
  project_id="3cccf9a4-73cb-4973-bde8-6321b0e12dbc",
  environment="production"
)

# Option 2: Environment variables (recommended for production)
# Set REGULAYER_API_KEY and REGULAYER_PROJECT_ID in your .env
client = Regulayer()`}</CodeBlock>

      <div className="bg-brand-600/5 border border-amber-500/20 rounded-lg p-4 my-4">
        <p className="text-xs text-amber-200/80"><strong>⚠ Security:</strong> Never hardcode API keys in source code. Use environment variables or a secrets manager in production.</p>
      </div>

      {/* Core Methods */}
      <h2 className="mt-10">Core Methods</h2>

      <MethodCard
        name="record"
        sig="client.record(input, output, model, **kwargs)"
        desc="Manually record a single AI decision. The SDK computes SHA-256 hashes of the input and output, packages the payload with timestamps, and sends it to the Regulayer gateway for immutable storage."
        params={[
          { name: "input", type: "str | dict", desc: "The prompt, query, or structured input sent to the AI model" },
          { name: "output", type: "str | dict", desc: "The model's response, generation, or structured output" },
          { name: "model", type: "str", desc: "Model identifier (e.g. 'gpt-4', 'claude-3-opus', 'llama-3')" },
          { name: "system_name", type: "str", desc: "Name of the AI system (e.g. 'support-bot')", optional: true },
          { name: "risk_level", type: "str", desc: "Risk classification: 'low', 'standard', 'high'", optional: true },
          { name: "metadata", type: "dict", desc: "Arbitrary key/value pairs (user_id, session_id, confidence, etc.)", optional: true },
          { name: "decision_id", type: "str", desc: "Custom UUID for the decision (auto-generated if omitted)", optional: true },
        ]}
        returns="RecordConfirmation — contains decision_id, record_id, record_hash"
        example={`result = client.record(
  input={"role": "user", "content": "What is the weather?"},
  output={"role": "assistant", "content": "It's sunny and 72°F."},
  model="gpt-4o",
  system_name="weather-assistant",
  risk_level="low",
  metadata={
    "user_id": "usr_12345",
    "session_id": "sess_abc",
    "confidence": 0.95,
    "token_count": 142
  }
)

print(f"Recorded: {result.decision_id}")
print(f"Hash:   {result.record_hash}")`}
      />

      <MethodCard
        name="trace"
        sig="@client.trace(model='...', system_name='...', tags=[])"
        desc="A decorator that automatically intercepts and records the inputs and outputs of any function. When the decorated function is called, the SDK captures the arguments as 'input', the return value as 'output', computes timing data, and sends the full payload to Regulayer. This is the recommended approach for wrapping LLM calls."
        params={[
          { name: "model", type: "str", desc: "Model identifier for the traced function" },
          { name: "system_name", type: "str", desc: "Name of the AI system", optional: true },
          { name: "tags", type: "list[str]", desc: "Tags for categorization", optional: true },
          { name: "risk_level", type: "str", desc: "Risk classification", optional: true },
        ]}
        returns="The original function's return value (recording happens in the background)"
        example={`import openai

@client.trace(model="gpt-4o", system_name="support-bot", tags=["customer-facing"])
def handle_support_query(user_message: str) -> str:
  response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[
      {"role": "system", "content": "You are a helpful support agent."},
      {"role": "user", "content": user_message}
    ]
  )
  return response.choices[0].message.content

# Every call is automatically recorded
answer = handle_support_query("How do I reset my password?")`}
      />

      {/* Real-World Integration */}
      <h2 className="mt-10">Real-World Integration Examples</h2>

      <h3>OpenAI Integration</h3>
      <CodeBlock>{`import openai
from regulayer import Regulayer

client = Regulayer() # Uses env vars

def chat_with_gpt(prompt: str) -> str:
  # Call OpenAI
  response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7
  )
  
  answer = response.choices[0].message.content
  tokens = response.usage.total_tokens
  
  # Record the decision in Regulayer
  client.record(
    input={"prompt": prompt},
    output={"response": answer},
    model="gpt-4o",
    metadata={
      "tokens": tokens,
      "temperature": 0.7,
      "finish_reason": response.choices[0].finish_reason
    }
  )
  
  return answer`}</CodeBlock>

      <h3 className="mt-6">LangChain Integration</h3>
      <CodeBlock>{`from langchain.chat_models import ChatOpenAI
from regulayer import Regulayer

client = Regulayer()
llm = ChatOpenAI(model="gpt-4o")

@client.trace(model="gpt-4o", system_name="langchain-agent")
def ask_agent(question: str) -> str:
  return llm.invoke(question).content

# Automatically traced and recorded
result = ask_agent("Summarize the Q4 earnings report")`}</CodeBlock>

      {/* Error Handling */}
      <h2 className="mt-10">Error Handling</h2>
      <p>The SDK provides specific exception types for different failure modes:</p>
      <CodeBlock>{`from regulayer import Regulayer
from regulayer.errors import (
  RegulayerAuthError,   # Invalid or expired API key
  RegulayerValidationError, # Malformed payload
  RegulayerNetworkError,  # Gateway unreachable
  RegulayerRateLimitError  # Rate limit exceeded
)

client = Regulayer()

try:
  client.record(
    input="Hello",
    output="World",
    model="gpt-4"
  )
except RegulayerAuthError:
  print("Check your API key")
except RegulayerNetworkError:
  print("Gateway unreachable — decision buffered locally")
except RegulayerRateLimitError as e:
  print(f"Rate limited. Retry after {e.retry_after}s")`}</CodeBlock>

      <div className="bg-slate-700/5 border border-slate-700/20 rounded-lg p-4 my-4">
        <p className="text-xs text-slate-700/80"><strong>💡 Tip:</strong> In production, the SDK is designed to <strong>never block your AI system</strong>. Network errors are caught internally and decisions are buffered for retry. Your LLM response is never delayed by Regulayer.</p>
      </div>
    </div>
  );
}
