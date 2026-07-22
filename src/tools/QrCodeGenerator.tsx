import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode, Wifi, Link, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';

type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'vcard' | 'sms';

export default function QrCodeGenerator() {
  const [type, setType] = useState<QrType>('url');
  
  // Basic Inputs
  const [url, setUrl] = useState('https://nuvoratools.dev');
  const [text, setText] = useState('Hello from NuvoraTools QR Generator!');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWifi');
  const [wifiPass, setWifiPass] = useState('SecretPass123');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [emailAddr, setEmailAddr] = useState('contact@example.com');
  const [emailSubject, setEmailSubject] = useState('Inquiry from QR');
  const [phoneNum, setPhoneNum] = useState('+1234567890');
  const [vFirstName, setVFirstName] = useState('John');
  const [vLastName, setVLastName] = useState('Doe');
  const [vCompany, setVCompany] = useState('Tech Corp');
  const [vPhone, setVPhone] = useState('+1234567890');
  const [vEmail, setVEmail] = useState('john.doe@techcorp.com');

  // Styling Options
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final payload string based on active tab
  const getPayload = (): string => {
    switch (type) {
      case 'url':
        return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      case 'text':
        return text;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPass};;`;
      case 'email':
        return `mailto:${emailAddr}?subject=${encodeURIComponent(emailSubject)}`;
      case 'phone':
        return `tel:${phoneNum}`;
      case 'sms':
        return `smsto:${phoneNum}:${text}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vLastName};${vFirstName}\nFN:${vFirstName} ${vLastName}\nORG:${vCompany}\nTEL:${vPhone}\nEMAIL:${vEmail}\nEND:VCARD`;
      default:
        return url;
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const payload = getPayload();

    QRCode.toCanvas(
      canvasRef.current,
      payload || 'https://nuvoratools.dev',
      {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      },
      (err) => {
        if (err) console.error(err);
      }
    );
  }, [type, url, text, wifiSsid, wifiPass, wifiEncryption, emailAddr, emailSubject, phoneNum, vFirstName, vLastName, vCompany, vPhone, vEmail, fgColor, bgColor, size, errorCorrection]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const image = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `qrcode_${type}.png`;
    link.click();
    triggerConfetti();
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        triggerConfetti();
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback to data url copy
        const dataUrl = canvasRef.current?.toDataURL('image/png') || '';
        copyToClipboard(dataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'url', label: 'Website URL', icon: Link },
          { id: 'text', label: 'Plain Text', icon: QrCode },
          { id: 'wifi', label: 'WiFi Network', icon: Wifi },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'phone', label: 'Phone', icon: Phone },
          { id: 'sms', label: 'SMS Message', icon: MessageSquare },
          { id: 'vcard', label: 'vCard Contact', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = type === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setType(tab.id as QrType)}
              className={`px-3 py-2 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Input Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Content Inputs
            </h3>

            {type === 'url' && (
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Target Website URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>
            )}

            {type === 'text' && (
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Text Message</label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type any message or note..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>
            )}

            {type === 'wifi' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-500 mb-1">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-500 mb-1">Password</label>
                    <input
                      type="password"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">Encryption</label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {type === 'email' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-500 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Default Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {type === 'phone' && (
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>
            )}

            {type === 'sms' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-500 mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">SMS Message Body</label>
                  <textarea
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {type === 'vcard' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-500 mb-1">First Name</label>
                  <input
                    type="text"
                    value={vFirstName}
                    onChange={(e) => setVFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={vLastName}
                    onChange={(e) => setVLastName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Company</label>
                  <input
                    type="text"
                    value={vCompany}
                    onChange={(e) => setVCompany(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">Phone</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color & Size Customization */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Visual Customization
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-neutral-500 mb-1">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">Size ({size}px)</label>
                <input
                  type="range"
                  min="180"
                  max="600"
                  step="20"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">Error Correction</label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* QR Output Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 text-center">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-inner inline-block">
            <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
          </div>

          <div className="w-full max-w-xs space-y-2">
            <button
              onClick={downloadPng}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG Image</span>
            </button>
            <button
              onClick={handleCopyImage}
              className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Image to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
