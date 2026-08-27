import type {
  DiffSegment,
  FieldKey,
  FieldMismatch,
  MismatchSeverity,
  RecordSource,
} from "@/lib/types";

const SOURCE_LABEL: Record<RecordSource, string> = {
  epfo: "EPFO record",
  aadhaar: "Aadhaar",
  pan: "PAN",
  bank: "Bank account",
  employer: "Employer record",
};

const FIELD_LABEL: Record<FieldKey, string> = {
  name: "Name",
  fatherName: "Father's or husband's name",
  dateOfBirth: "Date of birth",
  gender: "Gender",
  accountNumber: "Account number",
  ifsc: "IFSC code",
  dateOfJoining: "Date of joining",
  dateOfExit: "Date of exit",
  uan: "UAN",
};

const SEVERITY: Record<
  MismatchSeverity,
  { label: string; className: string; note: string }
> = {
  blocking: {
    label: "Blocking",
    className: "tag-danger",
    note: "This is almost certainly what stopped your claim. Fix this one first.",
  },
  probable: {
    label: "Probable",
    className: "tag-warn",
    note: "This may be contributing. Worth correcting, but check the blocking items first.",
  },
  tolerated: {
    label: "Not the cause",
    className: "tag-ok",
    note: "EPFO normalises this kind of difference. Leave it alone and look elsewhere.",
  },
};

export function MismatchCard({ mismatch }: { mismatch: FieldMismatch }) {
  const sev = SEVERITY[mismatch.severity];

  return (
    <li className="border border-rule-heavy rounded-lg overflow-hidden">
      <div className="border-b border-rule bg-paper-inset/60 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <p className="eyebrow">{FIELD_LABEL[mismatch.field]}</p>
        <span
          className={`tag ${sev.className}`}
        >
          {sev.label}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-rule">
        <ValueCell
          source={mismatch.left.source}
          value={mismatch.left.value}
          segments={mismatch.segments}
          show="removed"
        />
        <ValueCell
          source={mismatch.right.source}
          value={mismatch.right.value}
          segments={mismatch.segments}
          show="added"
        />
      </div>

      <div className="border-t border-rule px-4 py-3.5 bg-paper">
        <p className="text-sm leading-relaxed">{mismatch.reason}</p>
        <p className="text-sm text-ink-faint mt-1.5 leading-relaxed">
          {sev.note}
        </p>
      </div>
    </li>
  );
}

function ValueCell({
  source,
  value,
  segments,
  show,
}: {
  source: RecordSource;
  value: string;
  segments?: DiffSegment[];
  show: "removed" | "added";
}) {
  const highlight =
    show === "removed"
      ? "bg-stamp-wash text-stamp"
      : "bg-noting-wash text-noting";

  const visible = segments?.filter(
    (s) => s.state === "same" || s.state === show
  );

  return (
    <div className="px-4 py-4 bg-paper">
      <p className="eyebrow mb-2">{SOURCE_LABEL[source]}</p>
      <p className="machine text-base sm:text-lg break-words">
        {value === "" ? (
          <span className="text-ink-faint italic font-sans text-base">
            not recorded
          </span>
        ) : visible && visible.length ? (
          visible.map((seg, i) => (
            <span
              key={i}
              className={
                seg.state === "same"
                  ? ""
                  : `${highlight} rounded-xs px-0.5 font-medium`
              }
            >
              {seg.text === " " && seg.state !== "same" ? "␣" : seg.text}
            </span>
          ))
        ) : (
          value
        )}
      </p>
    </div>
  );
}
