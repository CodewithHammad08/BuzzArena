/**
 * QRCode – Renders a QR code for the room join link.
 * Includes copy-link and download-as-image buttons.
 */

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * @param {{ roomCode: string, size?: number }} props
 */
export default function QRCode({ roomCode, size = 180 }) {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  const joinUrl = `${window.location.origin}/join/${roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — share the URL manually');
    }
  };

  const handleDownload = () => {
    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `buzzarena-${roomCode}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="glass-card p-4 flex flex-col items-center gap-4">
      {/* QR Code */}
      <div
        ref={svgRef}
        className="p-3 rounded-xl"
        style={{ background: '#f1f5f9' }}
      >
        <QRCodeSVG
          value={joinUrl}
          size={size}
          bgColor="#f1f5f9"
          fgColor="#0a0a0f"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Room code */}
      <div className="text-center">
        <p className="text-xs text-buzz-muted uppercase tracking-widest mb-1">Room Code</p>
        <p className="text-2xl font-black text-buzz-yellow tracking-[0.25em]">{roomCode}</p>
      </div>

      {/* URL */}
      <div className="w-full bg-buzz-surface rounded-lg px-3 py-2 text-xs text-buzz-muted truncate text-center">
        {joinUrl}
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleCopy}
          className="btn-secondary flex-1 text-xs py-2"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleDownload}
          className="btn-ghost text-xs py-2 px-3 border border-buzz-border rounded-xl"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
