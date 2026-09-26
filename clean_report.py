import codecs
import re

path = 'd:/งานมด/activity-app/src/app/report/page.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    c = f.read()

# Remove states
c = re.sub(r'const \[dutyDay, setDutyDay\] = useState\(""\);\n', '', c)
c = re.sub(r'const \[friendsPresent, setFriendsPresent\] = useState<string\[\]>\(\[\]\);\n', '', c)

# Remove localstorage load/save for dutyDay
c = re.sub(r'const savedDutyDay = localStorage\.getItem\("internDutyDay"\);\n', '', c)
c = re.sub(r'if \(savedDutyDay\) setDutyDay\(savedDutyDay\);\n', '', c)
c = re.sub(r'localStorage\.setItem\("internDutyDay", dutyDay\);\n', '', c)

# Remove setDutyDay and setFriendsPresent from fetch block
c = re.sub(r'setDutyDay\(.*?;\n', '', c)
c = re.sub(r'setFriendsPresent\(.*?;\n', '', c)

# Remove toggleFriend function
c = re.sub(r'const toggleFriend =.*?};\n', '', c, flags=re.DOTALL)

# In handleSubmit, remove dutyDay and friendsPresent from payload
c = re.sub(r'dutyDay: dutyDay,\n', '', c)
c = re.sub(r'friendsPresent: friendsPresent,\n', '', c)

# Remove validation for dutyDay
c = re.sub(r'if \(!dutyDay\).*?\{\n.*?\}\n', '', c, flags=re.DOTALL)

# Remove UI for dutyDay and friendsPresent
c = re.sub(r'\{/\* วันทำเวร \*/\}.*?\{/\* รูปถ่าย Section \*/\}', '{/* รูปถ่าย Section */}', c, flags=re.DOTALL)

# Change Titles
c = c.replace('เช็คชื่อทำเวร', 'เช็คชื่อกิจกรรม')
c = c.replace('ถ่ายรูปหน้างาน 1 รูปต่อวัน', 'ถ่ายรูปยืนยันสถานที่')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(c)
print("Cleaned!")
