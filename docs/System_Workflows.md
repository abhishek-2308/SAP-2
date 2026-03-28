# System Workflows — User Journeys

## 1. Create Board
User → Click create board  
→ Enter title  
→ API call  
→ Board created  

---

## 2. Add List
User → Add list  
→ Enter title  
→ API call  
→ List appears  

---

## 3. Add Card
User → Add card  
→ Enter title  
→ API call  
→ Card created  

---

## 4. Drag Card
User drags card  
→ UI updates instantly  
→ API call  
→ DB updated  
→ Success  

---

## 5. Move Card Between Lists
User drags card to another list  
→ Calculate new position  
→ API call  
→ Update list_id + position  

---

## 6. Add Checklist
User opens card  
→ Adds checklist item  
→ API call  
→ Update DB  

---

## 7. Search & Filter
User enters query  
→ Filter applied client-side or server-side  

---

## 8. Failure Scenario
API fails  
→ UI rollback  
→ Show error  

