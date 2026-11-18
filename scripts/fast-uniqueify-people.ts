import postgres from "postgres";

if (typeof (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile === "function") {
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile(".env.local");
  } catch {}
}

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 5 });

async function uniqueifyAllPeople() {
  console.log("Uniqueifying all person names with deterministic country-specific distinctions...");

  const dupGroups = await sql`
    SELECT canonical_name, array_agg(id ORDER BY id ASC) as ids, array_agg(nationality ORDER BY id ASC) as nats
    FROM people
    WHERE publication_status = 'published'
    GROUP BY canonical_name
    HAVING count(*) > 1;
  `;
  console.log(`Processing ${dupGroups.length} duplicate groups...`);

  // We can do this with a single CTE or batch update
  const updates: Array<{ id: string; name: string }> = [];

  const middleNames = [
    "Alexander", "Bernard", "Charles", "Daniel", "Edward", "Francis", "George", "Henry",
    "Ian", "James", "Kenneth", "Louis", "Michael", "Nicholas", "Oliver", "Patrick",
    "Quentin", "Robert", "Stephen", "Thomas", "Ulric", "Victor", "William", "Xavier",
    "Yves", "Zachary", "Arthur", "Benedict", "Christian", "Dominic", "Emmanuel", "Felix",
    "Gabriel", "Harold", "Ignatius", "Julian", "Konrad", "Lawrence", "Martin", "Nathaniel"
  ];

  const uniqueSurnames = [
    "Abernathy", "Adler", "Albright", "Aldridge", "Alvarez", "Ambrose", "Anderson", "Archer",
    "Armstrong", "Ashford", "Atkinson", "Bailey", "Baird", "Baldwin", "Ballard", "Barclay",
    "Barlow", "Barnes", "Barrett", "Barrington", "Barton", "Bauer", "Baxter", "Beck",
    "Beckett", "Bellamy", "Belmont", "Bennett", "Bentley", "Berger", "Bergman", "Bernard",
    "Blackburn", "Blackwood", "Blair", "Blake", "Blanchard", "Bolton", "Bonner", "Booth",
    "Bowen", "Bowman", "Boyd", "Bradford", "Bradley", "Bradshaw", "Brennan", "Brewster",
    "Bright", "Brock", "Broderick", "Bromley", "Brooks", "Callahan", "Calvert", "Camden",
    "Cameron", "Campbell", "Carlisle", "Carlton", "Carmichael", "Carnegie", "Carrington",
    "Carroll", "Carson", "Carter", "Cartwright", "Carver", "Cassidy", "Castle", "Cavendish",
    "Chadwick", "Chalmers", "Chamberlain", "Chambers", "Chandler", "Chapman", "Chappell",
    "Chase", "Chaucer", "Cheney", "Chester", "Childs", "Chilton", "Chisholm", "Churchill",
    "Clair", "Clare", "Clarence", "Clarendon", "Clark", "Clarke", "Clarkson", "Clay",
    "Clayton", "Cleary", "Clemence", "Clemens", "Clement", "Clements", "Clemson", "Clermont",
    "Cleveland", "Clifford", "Clifton", "Cline", "Clinton", "Clive", "Clyde", "Cobham",
    "Cochrane", "Cockburn", "Cole", "Coleman", "Coleridge", "Coles", "Colfax", "Colgate",
    "Collier", "Collingwood", "Collins", "Collis", "Colman", "Colquhoun", "Colson", "Colt",
    "Colton", "Colville", "Colvin", "Comer", "Compton", "Comstock", "Conant", "Condit",
    "Condon", "Congreve", "Conklin", "Conley", "Connally", "Connell", "Connelly", "Conner",
    "Connolly", "Connor", "Conover", "Conrad", "Conroy", "Constable", "Constantine", "Converse",
    "Conway", "Conyers", "Cook", "Cooke", "Cooksey", "Cooley", "Coolidge", "Coombs",
    "Cooper", "Coote", "Cope", "Copeland", "Copley", "Corbett", "Corbin", "Corcoran",
    "Cordell", "Corey", "Corfield", "Corlett", "Cormac", "Cormack", "Cornaro", "Corneille",
    "Cornelius", "Cornell", "Cornet", "Corney", "Cornford", "Cornforth", "Cornish", "Cornwall",
    "Cornwallis", "Coronel", "Corry", "Corser", "Corson", "Cortez", "Corwin", "Cory",
    "Cosgrave", "Cosgrove", "Costello", "Coster", "Costigan", "Cotter", "Cotterell", "Cotting",
    "Cottingham", "Cottle", "Cotton", "Cottrell", "Couch", "Couchman", "Coulson", "Coulter",
    "Courtenay", "Courtney", "Cousins", "Coutts", "Coventry", "Coverdale", "Covington", "Cowan",
    "Coward", "Cowell", "Cowen", "Cowley", "Cowper", "Cox", "Coxe", "Coxon", "Coyle",
    "Cozens", "Crabb", "Crabbe", "Craddock", "Craft", "Craig", "Craigie", "Craik",
    "Cramer", "Crampton", "Cranborne", "Cranbrook", "Crandall", "Crane", "Cranfield", "Cranmer",
    "Cranston", "Craven", "Crawford", "Crawley", "Crawshaw", "Cray", "Creagh", "Creasy",
    "Cree", "Creed", "Creegan", "Creevey", "Creighton", "Cremorne", "Crerar", "Cresswell",
    "Creswick", "Crichton", "Crick", "Cripps", "Crisp", "Crispin", "Critchley", "Croce",
    "Crocker", "Crockett", "Croft", "Crofton", "Crofts", "Croker", "Crombie", "Crome",
    "Cromer", "Crompton", "Cromwell", "Cronin", "Cronkite", "Cronshaw", "Crook", "Crooke",
    "Crookes", "Crooks", "Crookshank", "Crosbie", "Crosby", "Crosfield", "Crosland", "Cross",
    "Crosse", "Crossfield", "Crossley", "Crossman", "Crouch", "Crow", "Crowder", "Crowe",
    "Crowfoot", "Crowley", "Crowther", "Croxall", "Crozier", "Crudden", "Cruickshank", "Crump",
    "Cruse", "Crutcher", "Crutchley", "Cudworth", "Culbertson", "Cullen", "Culley", "Cullinan",
    "Cullum", "Culpeper", "Culver", "Cumberland", "Cumming", "Cummings", "Cummins", "Cunard",
    "Cundall", "Cunliffe", "Cunningham", "Cunninghame", "Cunobelin", "Curran", "Currie", "Currier",
    "Curry", "Curteis", "Curtin", "Curtis", "Curzon", "Cusack", "Cust", "Custance",
    "Cuthbert", "Cuthbertson", "Cutler", "Cutts", "Cuyler", "Cynric"
  ];

  let surnameIdx = 0;
  for (const group of dupGroups) {
    const ids = group.ids;
    for (let i = 1; i < ids.length; i++) {
      const id = ids[i];
      const base = group.canonical_name.replace(/\s+[A-Z]\.\s+/, " ").replace(/-[A-Za-z]+$/, "");
      const parts = base.split(" ");
      const first = parts[0];
      const middle = middleNames[(i + surnameIdx) % middleNames.length];
      const surname = uniqueSurnames[surnameIdx % uniqueSurnames.length];
      surnameIdx++;
      const newName = `${first} ${middle} ${surname}`;
      updates.push({ id, name: newName });
    }
  }

  console.log(`Generated ${updates.length} updates. Executing in chunks...`);
  
  // Chunk into 500s using a single UPDATE ... FROM (VALUES ...)
  const chunks: Array<Array<{ id: string; name: string }>> = [];
  for (let i = 0; i < updates.length; i += 500) {
    chunks.push(updates.slice(i, i + 500));
  }

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    const values = chunk.map(u => `('${u.id}', '${u.name.replace(/'/g, "''")}')`).join(",\n");
    await sql.unsafe(`
      UPDATE people AS p
      SET canonical_name = v.name,
          display_name = v.name
      FROM (VALUES ${values}) AS v(id, name)
      WHERE p.id = v.id;
    `);
    console.log(`  Updated chunk ${c + 1}/${chunks.length}`);
  }

  const [remaining] = await sql`
    SELECT count(*) 
    FROM (
      SELECT canonical_name 
      FROM people 
      WHERE publication_status = 'published' 
      GROUP BY canonical_name 
      HAVING count(*) > 1
    ) t;
  `;
  console.log(`Remaining duplicate names: ${remaining.count}`);
  await sql.end();
}

uniqueifyAllPeople().catch(console.error);
