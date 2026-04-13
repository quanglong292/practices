import { useEffect, useRef, useState } from "react";
import "./MusicPlayer.css";
import { useMusicPlayer, type Song } from "./useMusicPlayer";

const DEMO_SONGS: Song[] = [
    {
        id: "1",
        title: "Neon Waves",
        artist: "Synthwave Collective",
        duration: 234,
        cover: "/covers/cover1.png",
    },
    {
        id: "2",
        title: "Golden Geometry",
        artist: "Ethereal Minds",
        duration: 198,
        cover: "/covers/cover2.png",
    },
    {
        id: "3",
        title: "Burning Horizon",
        artist: "Sunset Nomads",
        duration: 267,
        cover: "/covers/cover3.png",
    },
    {
        id: "4",
        title: "Deep Blue Dream",
        artist: "Abyssal Echo",
        duration: 312,
        cover: "/covers/cover4.png",
    },
    {
        id: "5",
        title: "Cosmic Spiral",
        artist: "Nebula Drift",
        duration: 285,
        cover: "/covers/cover5.png",
    },
];

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// SVG Icons as components
const PlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-play">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const PrevIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-sm">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
);

const NextIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-sm">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const MusicNoteIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-xs">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

const FirstIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-sm">
        <path d="M18 18l-8.5-6L18 6v12zM8 6H6v12h2V6z" />
    </svg>
);

const LastIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-sm">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const SortIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-xs">
        <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
    </svg>
);

const AddIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-xs">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mp-icon mp-icon-xs">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
);

export default function MusicPlayer() {
    const {
        currentSong,
        playlist,
        currentIndex,
        isPlaying,
        progress,
        setProgress,
        addSong,
        deleteSong,
        next,
        previous,
        jumpTo,
        jumpToFirst,
        jumpToLast,
        sortPlaylist,
        togglePlay,
        hasNext,
        hasPrevious,
    } = useMusicPlayer();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newArtist, setNewArtist] = useState("");
    const [newDuration, setNewDuration] = useState("");

    const handleAddSong = () => {
        if (!newTitle.trim() || !newArtist.trim()) return;
        addSong({
            id: Date.now().toString(),
            title: newTitle.trim(),
            artist: newArtist.trim(),
            duration: Number(newDuration) || 180,
            cover: `/covers/cover${(playlist.length % 5) + 1}.png`,
        });
        setNewTitle("");
        setNewArtist("");
        setNewDuration("");
        setShowAddForm(false);
    };

    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const initialized = useRef(false);

    // Initialize demo songs
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        DEMO_SONGS.forEach((song) => addSong(song));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Simulate progress when playing
    useEffect(() => {
        if (isPlaying && currentSong) {
            progressInterval.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        // Auto next when song ends
                        if (hasNext) next();
                        return 0;
                    }
                    return prev + 100 / currentSong.duration;
                });
            }, 1000);
        }

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [isPlaying, currentSong, setProgress, hasNext, next]);

    const currentTime = currentSong
        ? Math.floor((progress / 100) * currentSong.duration)
        : 0;

    return (
        <div className="mp-root">
            {/* Background blur effect from current cover */}
            {currentSong && (
                <div
                    className="mp-bg-blur"
                    style={{ backgroundImage: `url(${currentSong.cover})` }}
                />
            )}

            <div className="mp-container">
                {/* Header */}
                <div className="mp-header">
                    <div className="mp-header-dot" />
                    <h1 className="mp-title">Now Playing</h1>
                    <div className="mp-header-badge">
                        <MusicNoteIcon />
                        <span>{playlist.length} tracks</span>
                    </div>
                </div>

                <div className="mp-content">
                    {/* Album Art Section */}
                    <div className="mp-art-section">
                        <div className={`mp-art-wrapper ${isPlaying ? "mp-art-playing" : ""}`}>
                            {currentSong ? (
                                <img
                                    src={currentSong.cover}
                                    alt={currentSong.title}
                                    className="mp-art-img"
                                />
                            ) : (
                                <div className="mp-art-placeholder">
                                    <MusicNoteIcon />
                                </div>
                            )}
                            {/* Vinyl ring overlay */}
                            <div className="mp-vinyl-ring" />
                        </div>

                        {/* Song Info */}
                        <div className="mp-song-info">
                            <h2 className="mp-song-title" key={currentSong?.id}>
                                {currentSong?.title || "Select a song"}
                            </h2>
                            <p className="mp-song-artist">
                                {currentSong?.artist || "—"}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mp-progress-section">
                            <span className="mp-time">{formatTime(currentTime)}</span>
                            <div
                                className="mp-progress-track"
                                onClick={(e) => {
                                    if (!currentSong) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = ((e.clientX - rect.left) / rect.width) * 100;
                                    setProgress(Math.max(0, Math.min(100, pct)));
                                }}
                            >
                                <div
                                    className="mp-progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                                <div
                                    className="mp-progress-thumb"
                                    style={{ left: `${progress}%` }}
                                />
                            </div>
                            <span className="mp-time">
                                {currentSong ? formatTime(currentSong.duration) : "0:00"}
                            </span>
                        </div>

                        {/* Controls */}
                        <div className="mp-controls">
                            <button
                                id="btn-first"
                                className="mp-btn mp-btn-tertiary"
                                onClick={jumpToFirst}
                                disabled={!playlist.length}
                                aria-label="Jump to first"
                                title="First song (head)"
                            >
                                <FirstIcon />
                            </button>
                            <button
                                id="btn-prev"
                                className="mp-btn mp-btn-secondary"
                                onClick={previous}
                                disabled={!hasPrevious}
                                aria-label="Previous track"
                            >
                                <PrevIcon />
                            </button>
                            <button
                                id="btn-play"
                                className="mp-btn mp-btn-primary"
                                onClick={togglePlay}
                                disabled={!currentSong}
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button
                                id="btn-next"
                                className="mp-btn mp-btn-secondary"
                                onClick={next}
                                disabled={!hasNext}
                                aria-label="Next track"
                            >
                                <NextIcon />
                            </button>
                            <button
                                id="btn-last"
                                className="mp-btn mp-btn-tertiary"
                                onClick={jumpToLast}
                                disabled={!playlist.length}
                                aria-label="Jump to last"
                                title="Last song (tail)"
                            >
                                <LastIcon />
                            </button>
                        </div>
                    </div>

                    {/* Playlist Section */}
                    <div className="mp-playlist-section">
                        {/* Toolbar: Sort + Add */}
                        <div className="mp-toolbar">
                            <h3 className="mp-playlist-title">Playlist</h3>
                            <div className="mp-toolbar-actions">
                                <div className="mp-sort-group">
                                    <SortIcon />
                                    <select
                                        id="sort-select"
                                        className="mp-select"
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                sortPlaylist(e.target.value as "title" | "artist" | "duration");
                                                e.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Sort…</option>
                                        <option value="title">By Title</option>
                                        <option value="artist">By Artist</option>
                                        <option value="duration">By Duration</option>
                                    </select>
                                </div>
                                <button
                                    id="btn-add-song"
                                    className="mp-btn mp-btn-accent"
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    aria-label="Add song"
                                >
                                    <AddIcon />
                                </button>
                            </div>
                        </div>

                        {/* Add Song Form */}
                        {showAddForm && (
                            <div className="mp-add-form">
                                <input
                                    id="input-title"
                                    className="mp-input"
                                    placeholder="Song title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                                />
                                <input
                                    id="input-artist"
                                    className="mp-input"
                                    placeholder="Artist"
                                    value={newArtist}
                                    onChange={(e) => setNewArtist(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                                />
                                <input
                                    id="input-duration"
                                    className="mp-input mp-input-sm"
                                    placeholder="Duration (sec)"
                                    type="number"
                                    value={newDuration}
                                    onChange={(e) => setNewDuration(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                                />
                                <button
                                    id="btn-submit-song"
                                    className="mp-btn mp-btn-accent"
                                    onClick={handleAddSong}
                                >
                                    Add
                                </button>
                            </div>
                        )}
                        <div className="mp-playlist-list">
                            {playlist.map((song, i) => (
                                <button
                                    key={song.id}
                                    id={`track-${song.id}`}
                                    className={`mp-track ${i === currentIndex ? "mp-track-active" : ""}`}
                                    onClick={() => jumpTo(i)}
                                >
                                    <div className="mp-track-index">
                                        {i === currentIndex && isPlaying ? (
                                            <div className="mp-equalizer">
                                                <span /><span /><span />
                                            </div>
                                        ) : (
                                            <span className="mp-track-num">{i + 1}</span>
                                        )}
                                    </div>
                                    <img
                                        src={song.cover}
                                        alt={song.title}
                                        className="mp-track-cover"
                                    />
                                    <div className="mp-track-info">
                                        <span className="mp-track-title">{song.title}</span>
                                        <span className="mp-track-artist">{song.artist}</span>
                                    </div>
                                    <span className="mp-track-duration">
                                        {formatTime(song.duration)}
                                    </span>
                                    <button
                                        className="mp-btn mp-btn-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSong(i);
                                        }}
                                        aria-label={`Delete ${song.title}`}
                                        title="Delete song"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
