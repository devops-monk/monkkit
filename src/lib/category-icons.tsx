import {
  AlignLeft, ArrowLeftFromLine, ArrowLeftRight, ArrowRightFromLine, ArrowUpDown,
  Binary, Braces, Building2, Calculator, CalendarDays, CaseSensitive, Clock,
  Code, Cpu, Database, FileCode, FileKey, FilePen, FilePlus, FilePlus2,
  FileSearch, FileText, FileType, Filter, Fingerprint, FlipHorizontal,
  GitCompare, Globe, Hash, HeartPulse, Image, Key, KeyRound, Layers, Link,
  Link2, ListOrdered, ListX, Lock, Mail, MapPin, Mic, Network, QrCode, Radio,
  RefreshCw, Replace, RotateCw, ScanLine, Search, Settings, ShieldAlert,
  ShieldCheck, ShieldOff, ShieldPlus, Table, TextSearch, ToggleLeft,
  Type, Calendar, Wrench, Zap,
} from "lucide-react";
import type { ComponentType } from "react";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  AlignLeft, ArrowLeftFromLine, ArrowLeftRight, ArrowRightFromLine, ArrowUpDown,
  Binary, Braces, Building2, Calculator, CalendarDays, CaseSensitive, Clock,
  Code, Cpu, Database, FileCode, FileKey, FilePen, FilePlus, FilePlus2,
  FileSearch, FileText, FileType, Filter, Fingerprint, FlipHorizontal,
  GitCompare, Globe, Hash, HeartPulse, Image, Key, KeyRound, Layers, Link,
  Link2, ListOrdered, ListX, Lock, Mail, MapPin, Mic, Network, QrCode, Radio,
  RefreshCw, Replace, RotateCw, ScanLine, Search, Settings, ShieldAlert,
  ShieldCheck, ShieldOff, ShieldPlus, Table, TextSearch, ToggleLeft,
  Type, Calendar, Wrench, Zap,
};

export function getCategoryIcon(iconName: string): ComponentType<{ className?: string }> {
  return ICONS[iconName] ?? Braces;
}
