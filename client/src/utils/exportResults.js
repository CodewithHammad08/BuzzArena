/**
 * Export Results Utility
 * Supports CSV, JSON, and PDF export of quiz results.
 */

/**
 * Export leaderboard as CSV.
 * @param {Array<{name: string, score: number, buzzWins: number}>} teams
 * @param {Array} history
 */
export function exportCSV(teams, history = []) {
  const rows = [
    ['Rank', 'Team Name', 'Score', 'Buzz Wins'],
    ...teams.map((team, i) => [i + 1, team.name, team.score, team.buzzWins]),
  ];

  const csv = rows.map((r) => r.map(String).join(',')).join('\n');
  downloadFile(csv, 'buzzarena-results.csv', 'text/csv');
}

/**
 * Export full results as JSON.
 */
export function exportJSON(teams, history = [], roomCode = '') {
  const data = {
    exportedAt: new Date().toISOString(),
    roomCode,
    leaderboard: teams,
    history,
  };
  downloadFile(JSON.stringify(data, null, 2), 'buzzarena-results.json', 'application/json');
}

/**
 * Export results as a PDF using jsPDF + autoTable.
 */
export async function exportPDF(teams, history = [], roomCode = '') {
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(245, 197, 24);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BuzzArena Results', 14, 18);

    if (roomCode) {
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Room: ${roomCode}  |  ${new Date().toLocaleDateString()}`, 14, 26);
    }

    // Leaderboard table
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Final Leaderboard', 14, 42);

    autoTable(doc, {
      startY: 46,
      head: [['Rank', 'Team', 'Score', 'Buzz Wins']],
      body: teams.map((t, i) => [i + 1, t.name, t.score, t.buzzWins]),
      theme: 'grid',
      headStyles: { fillColor: [245, 197, 24], textColor: [10, 10, 15], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [26, 26, 46] },
      styles: { textColor: [241, 245, 249], fillColor: [18, 18, 26] },
    });

    // Round history
    if (history.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Round History', 14, finalY);

      autoTable(doc, {
        startY: finalY + 4,
        head: [['Round', 'Winner', 'Reaction Time']],
        body: history.map((h) => [
          `Round ${h.roundNumber}`,
          h.winner || '—',
          h.reactionTime ? `${h.reactionTime}ms` : '—',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [26, 26, 46] },
        styles: { textColor: [241, 245, 249], fillColor: [18, 18, 26] },
      });
    }

    doc.save(`buzzarena-results-${roomCode || 'export'}.pdf`);
  } catch (err) {
    console.error('[Export] PDF export failed:', err);
    // Fallback to JSON
    exportJSON(teams, history, roomCode);
  }
}

/** Helper: trigger browser file download. */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
