export function InstagramIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill={color} />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a9 9 0 0 0-7.79 13.5L3 21l4.65-1.19A9 9 0 1 0 12 3Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.7c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.4.2.5.7 1.6.7 1.7.1.1.1.3 0 .4-.1.2-.2.3-.3.4-.1.2-.3.3-.1.6.2.4.9 1.4 1.9 2.3 1.3 1.1 2.2 1.4 2.5 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4.1.3.1 1.1-.3 1.6-.4.6-1.6 1.1-2.4 1.1-.7 0-1.9-.1-3.6-1-2.2-1.1-3.6-3.2-3.7-3.4-.1-.1-1-1.3-1-2.6 0-1.2.6-1.8.8-2.1Z"
        fill={color}
      />
    </svg>
  );
}
