"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  HelpCircle,
  Radio,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import type { AttendanceMode, Confidence, Participant, ParticipantProminence, RemoteConnectionType } from "@/lib/rewind/types";
import { STANDARD_CAPACITIES } from "@/lib/rewind/types";

export interface AddParticipantModalProps {
  eventId?: string;
  eventName: string;
  existingParticipants?: Participant[];
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: Participant) => void;
}

export function AddParticipantModal({
  eventId,
  eventName,
  existingParticipants = [],
  isOpen,
  onClose,
  onAddParticipant,
}: AddParticipantModalProps) {
  const [personName, setPersonName] = useState("");
  const [personId, setPersonId] = useState("");
  const [role, setRole] = useState(""); // Official title/office
  const [association, setAssociation] = useState<string>("participant"); // Event capacity
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>("physical");
  const [presenceConfidence, setPresenceConfidence] = useState<Confidence>("limited");
  const [prominence, setProminence] = useState<ParticipantProminence>("participant");
  const [isCentralFigure, setIsCentralFigure] = useState(false);

  // Remote location state
  const [remoteCity, setRemoteCity] = useState("");
  const [remoteCountry, setRemoteCountry] = useState("");
  const [remoteVenue, setRemoteVenue] = useState("");
  const [remoteConnectionType, setRemoteConnectionType] = useState<RemoteConnectionType>("satellite-feed");
  const [remoteOverlayText, setRemoteOverlayText] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRemote =
    attendanceMode === "remote-live" ||
    attendanceMode === "remote-recorded" ||
    attendanceMode === "telephone";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = personName.trim();
    if (!trimmedName) {
      setValidationError("Please enter the participant's full personal name.");
      return;
    }

    const slug = personId.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Guard against duplicate addition
    if (existingParticipants.some((p) => p.personId === slug || p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setValidationError(`'${trimmedName}' is already attached to this event.`);
      return;
    }

    const newParticipant: Participant = {
      personId: slug,
      slug,
      name: trimmedName,
      role: role.trim() || undefined,
      association,
      attendanceMode,
      presenceConfidence,
      prominence,
      isCentralFigure,
      remoteLocation: isRemote
        ? {
            city: remoteCity.trim() || undefined,
            country: remoteCountry.trim() || undefined,
            venueName: remoteVenue.trim() || undefined,
            connectionType: remoteConnectionType,
            overlayText: remoteOverlayText.trim() || undefined,
          }
        : undefined,
    };

    onAddParticipant(newParticipant);
    onClose();
  };

  return (
    <div
      className="participant-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-participant-title"
      data-event-id={eventId}
    >
      <div className="participant-modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0b151e] border border-[#1e293b] rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users size={18} />
            </div>
            <div>
              <h2 id="add-participant-title" className="text-lg font-bold text-slate-100">
                Add Participant to Event
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Document attendee capacity and evidentiary details for &ldquo;{eventName}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {validationError && (
          <div className="my-4 p-3 bg-red-950/40 border border-red-500/40 rounded-lg flex items-center gap-2.5 text-xs text-red-200" role="alert">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Section 1: Figure Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={14} /> Figure Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Personal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. William J. Clinton"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Person Slug / ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. bill-clinton"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Capacity vs Official Role Questionnaire */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={14} /> Capacity & Mandate Questionnaire
              </h3>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <HelpCircle size={12} /> Distinguish office from event capacity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Public Office / Title (At Time of Event)
                </label>
                <input
                  type="text"
                  placeholder="e.g. President of the United States"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Capacity / Association *
                </label>
                <select
                  value={association}
                  onChange={(e) => setAssociation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <optgroup label="Standard Historical Capacities">
                    {STANDARD_CAPACITIES.map((cap) => (
                      <option key={cap} value={cap}>
                        {cap}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Basic Associations">
                    <option value="participant">Participant</option>
                    <option value="attendee">Attendee</option>
                    <option value="host">Host</option>
                    <option value="interviewee">Interviewee</option>
                    <option value="moderator">Moderator</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Attendance Mode & Remote Localization */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={14} /> Attendance Mode & Localization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Attendance Mode
                </label>
                <select
                  value={attendanceMode}
                  onChange={(e) => setAttendanceMode(e.target.value as AttendanceMode)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="physical">Physical Presence (In-Person)</option>
                  <option value="remote-live">Remote Appearance (Live Video/Audio)</option>
                  <option value="remote-recorded">Pre-Recorded Statement</option>
                  <option value="telephone">Telephone Appearance</option>
                  <option value="written">Written Statement Read</option>
                  <option value="proxy">Official Proxy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prominence
                </label>
                <select
                  value={prominence}
                  onChange={(e) => setProminence(e.target.value as ParticipantProminence)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="principal">Principal Figure</option>
                  <option value="host">Event Host</option>
                  <option value="keynote">Keynote Speaker</option>
                  <option value="participant">Participant</option>
                  <option value="observer">Observer / Dignitary</option>
                  <option value="remote-contributor">Remote Contributor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Evidentiary Confidence
                </label>
                <select
                  value={presenceConfidence}
                  onChange={(e) => setPresenceConfidence(e.target.value as Confidence)}
                  className="w-full px-3 py-2 bg-[#070d12] border border-[#1e293b] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="limited">Limited (Uncorroborated / Default)</option>
                  <option value="strong">Strong (Multiple press reports)</option>
                  <option value="confirmed">Confirmed (Official record / footage)</option>
                  <option value="disputed">Disputed (Contradictory evidence)</option>
                </select>
              </div>
            </div>

            {/* Remote Localization Sub-form */}
            {isRemote && (
              <div className="p-3 bg-sky-950/20 border border-sky-500/30 rounded-lg space-y-3 mt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Video size={14} /> Remote Origin Geolocation (Mandatory for Remote Appearances)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Origin City</label>
                    <input
                      type="text"
                      placeholder="e.g. Washington, D.C."
                      value={remoteCity}
                      onChange={(e) => setRemoteCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#070d12] border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Origin Country</label>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      value={remoteCountry}
                      onChange={(e) => setRemoteCountry(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#070d12] border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Remote Studio / Venue</label>
                    <input
                      type="text"
                      placeholder="e.g. White House Briefing Room"
                      value={remoteVenue}
                      onChange={(e) => setRemoteVenue(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#070d12] border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Connection Medium</label>
                    <select
                      value={remoteConnectionType}
                      onChange={(e) => setRemoteConnectionType(e.target.value as RemoteConnectionType)}
                      className="w-full px-2.5 py-1.5 bg-[#070d12] border border-slate-700 rounded text-xs text-slate-100"
                    >
                      <option value="satellite-feed">Live Satellite Feed</option>
                      <option value="fiber-optic">Fiber Optic Pool Feed</option>
                      <option value="microwave-relay">Microwave Relay</option>
                      <option value="isdn-audio">ISDN Audio Line</option>
                      <option value="digital-stream">Secure Digital Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">On-Screen Overlay Text</label>
                    <input
                      type="text"
                      placeholder='e.g. "Live via Satellite from Washington"'
                      value={remoteOverlayText}
                      onChange={(e) => setRemoteOverlayText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#070d12] border border-slate-700 rounded text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="central-figure-chk"
                checked={isCentralFigure}
                onChange={(e) => setIsCentralFigure(e.target.checked)}
                className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 h-4 w-4 bg-[#070d12]"
              />
              <label htmlFor="central-figure-chk" className="text-xs text-slate-300 font-medium">
                Designate as Primary Subject / Central Figure of Event
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              Attach Participant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
