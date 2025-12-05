import * as dateFns from "date-fns";

export interface FiscalYear {
  year: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

const getFiscalYearDuration = ({
  from,
  to,
}: {
  from: Date;
  to: Date;
}): FiscalYear[] => {
  const fiscalYears: FiscalYear[] = [];

  if (dateFns.isAfter(from, to)) {
    return [];
  }

  let fyStartYear = dateFns.getYear(from);
  const isBeforeApril = dateFns.isBefore(from, new Date(fyStartYear, 3, 1));
  let fyEndYear = dateFns.getYear(to);
  const isAfterMarch = dateFns.isAfter(to, new Date(fyEndYear, 2, 31));
  const isBeforeAprilEnd = dateFns.isBefore(to, new Date(fyEndYear, 3, 1));

  //   if (isAfterMarch) {
  //     fyEndYear += 1;
  //   } else

  if (isBeforeAprilEnd) {
    fyEndYear -= 1;
  }

  if (isBeforeApril) {
    fyStartYear -= 1;
  }

  const yearRange = fyEndYear - fyStartYear;

  for (let i = 0; i <= yearRange; i++) {
    const year = fyStartYear + i;
    const startDate = new Date(year, 3, 1); // April 1st
    const endDate = new Date(year + 1, 2, 31); // March 31st
    const label = `FY${year}`;

    fiscalYears.push({ year, startDate, endDate, label });

    console.log({ year, yearRange, fyEndYear, fyStartYear });
  }

  return fiscalYears;
};

const DateFns = () => {
  return <div>DateFns</div>;
};

export default DateFns;

// Some test cases
// from: 15/02/2025 to: 20/05/2027 => FY2024, FY2025, FY2026
// from: 01/04/2025 to: 31/03/2026 => FY2025

const cases = [
  {
    // 2/4/2024 - 30/3/2025 = FY2024
    from: new Date(2024, 3, 2),
    to: new Date(2025, 2, 30),
    should: ["FY2024"],
  },
  {
    // 1/4/2023 - 31/3/2025 = FY2023, FY2024
    from: new Date(2023, 3, 1),
    to: new Date(2025, 2, 31),
    should: ["FY2023", "FY2024"],
  },
  {
    // 15/2/2025 - 20/5/2027 = FY2024, FY2025, FY2026, FY2027
    from: new Date(2025, 1, 15),
    to: new Date(2027, 4, 20),
    should: ["FY2024", "FY2025", "FY2026", "FY2027"],
  },
  {
    // 01/04/2024 - 31/03/2024 = []
    from: new Date(2024, 3, 1),
    to: new Date(2024, 2, 31),
    should: [],
  },
  {
    // 01/04/2024 - 31/03/2025 = FY2024
    from: new Date(2024, 3, 1),
    to: new Date(2025, 2, 31),
    should: ["FY2024"],
  },
  {
    // 01/04/2024 - 02/04/2024 = FY2024
    from: new Date(2024, 3, 1),
    to: new Date(2024, 3, 2),
    should: ["FY2024"],
  }
];

for (const { from, to, should } of cases) {
  const fiscalYears = getFiscalYearDuration({ from, to });
  console.log(`From ${from.toDateString()} to ${to.toDateString()}:`, {
    fiscalYears,
    fromToString: `From ${from.toDateString()} to ${to.toDateString()}`,
    should,
    correct: fiscalYears.map((fy) => fy.label).toString() === should.toString(),
  });
}
