// Mock data (kept in browser localStorage). Replace with API calls when the backend is ready.
const KEY='es_db2';
function db(){let d=localStorage.getItem(KEY);if(d)return JSON.parse(d);d=SEED();save(d);return d}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
const nid=a=>Math.max(0,...a.map(x=>x.id))+1;
const chosen=(D,sid)=>D.students.filter(s=>Object.values(s.picks).includes(sid)).length;
function token(D,email,hours){const t=Math.random().toString(36).slice(2)+Date.now().toString(36);D.tokens=D.tokens.filter(x=>x.email!==email||x.used);D.tokens.push({t,email,exp:Date.now()+hours*36e5,used:false});return t}
function SEED(){
const S=(id,reg,name,prog,o)=>Object.assign({id,reg,name,email:name.split(' ')[0].toLowerCase()+'@student.edu.pk',phone:'0300-1234567',cnic:'35202-1234567-1',dob:'2004-05-12',gender:'Male',address:'12 Garden Town, Lahore',father:'Raza Hussain',pcnic:'35202-7654321-1',occ:'Engineer',pphone:'0301-7654321',emerg:'0322-1112233',program:prog,sem:3,batch:'Fall 2025',qual:'FSc Pre-Eng',inst:'Govt College',cgpa:'3.4',status:'active',password:'Student123',branchId:null,branchUnlock:false,sheetSaved:false,sheetUnlock:false,savedAt:null,courses:[],picks:{}},o);
const B=(id,code,name,city,ph,a,active=true)=>({id,code,name,city,phone:ph,address:a,active});
const C=(id,code,title,cr,dept,active=true)=>({id,code,title,cr,dept,active});
const L=(id,courseId,date,start,end,seats=60)=>({id,courseId,date,start,end,seats});
return{admin:{id:0,name:'Admin',email:'admin@examslot.edu.pk',password:'Admin123'},
branches:[B(1,'LHR-01','Lahore Campus','Lahore','042-111-000','12 Canal Road'),B(2,'KHI-01','Karachi Campus','Karachi','021-111-000','44 Shahrah-e-Faisal'),B(3,'ISB-01','Islamabad Campus','Islamabad','051-111-000','Sector G-9'),B(4,'MUX-01','Multan Campus','Multan','061-111-000','Cantt Road',false)],
courses:[C(1,'CS101','Introduction to Computing',3,'Computer Science'),C(2,'MTH101','Calculus I',3,'Mathematics'),C(3,'ENG101','English Composition',3,'English'),C(4,'CS201','Data Structures',3,'Computer Science'),C(5,'STA301','Statistics',3,'Mathematics'),C(6,'CS301','Database Systems',3,'Computer Science'),C(7,'PHY101','Applied Physics',4,'Physics',false),C(8,'CS401','Operating Systems',3,'Computer Science')],
slots:[L(1,1,'2026-11-16','09:00','12:00'),L(2,1,'2026-11-18','14:00','17:00'),L(3,2,'2026-11-17','09:00','12:00'),L(4,2,'2026-11-19','14:00','17:00'),L(5,3,'2026-11-19','09:00','',1),L(6,3,'2026-11-16','09:00','12:00'),L(7,4,'2026-11-20','14:00','17:00'),L(8,4,'2026-11-21','09:00','12:00'),L(9,5,'2026-11-23','09:00','12:00'),L(10,6,'2026-11-24','09:00','12:00'),L(11,6,'2026-11-25','14:00','17:00'),L(12,8,'2026-11-26','09:00','12:00'),L(13,5,'2026-11-27','14:00','17:00')],
students:[S(1,'VU-2301','Ali Raza','BSCS',{courses:[1,2,3,4],branchId:1}),
S(2,'VU-2302','Sara Khan','BSCS',{courses:[1,2,3,4,5],branchId:2,sheetSaved:true,savedAt:'2026-10-09T11:45:00',picks:{1:1,2:3,3:5,4:7,5:9}}),
S(3,'VU-2303','Usman Tariq','BBA',{courses:[1,2,3],status:'invite',password:null}),
S(4,'VU-2304','Hina Malik','BBA',{courses:[1,2],branchId:3}),S(5,'VU-2305','Bilal Ahmed','BSSE',{courses:[1,2,3,4,5,6],branchId:1})],
requests:[{id:1,sid:2,type:'branch',reason:'Need to sit near home for family reasons.',raised:'2026-10-08',status:'pending',remark:'',used:false},{id:2,sid:4,type:'sheet',reason:'Wrong date picked.',raised:'2026-10-04',status:'rejected',remark:'Exams fixed.',used:false}],
tokens:[]}}
