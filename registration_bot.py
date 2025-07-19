import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import threading
import time
import sys
import random
from datetime import datetime, time as dt_time

class RegistrationBotUI:
    def __init__(self, root):
        self.root = root
        self.root.title("AutoReg Pro - Universal Registration Bot")
        self.root.geometry("1000x800")
        self.root.resizable(True, True)
        
        # Style Configuration
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.configure_styles()
        
        # Main Frame with Notebook for tabs
        self.main_frame = ttk.Frame(root, padding="20")
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header
        self.header_frame = ttk.Frame(self.main_frame)
        self.header_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(self.header_frame, 
                 text="AutoReg Pro", 
                 font=('Helvetica', 24, 'bold'), 
                 foreground="#2c3e50").pack(side=tk.LEFT)
        
        # Status Indicator
        self.status_var = tk.StringVar(value="🟢 Ready")
        self.status_label = ttk.Label(self.header_frame, 
                                    textvariable=self.status_var,
                                    font=('Helvetica', 10),
                                    foreground="#27ae60")
        self.status_label.pack(side=tk.RIGHT)
        
        # Create Notebook for tabs
        self.notebook = ttk.Notebook(self.main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Main Tab
        self.main_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.main_tab, text="Registration")
        
        # Settings Tab
        self.settings_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.settings_tab, text="Settings")
        
        self.setup_main_tab()
        self.setup_settings_tab()
        
        # Bot variables
        self.bot_running = False
        self.driver = None
        self.registrations = []
        self.phone_numbers = []
        self.current_phone_index = 0
        
        # Configuration variables
        self.speed_var = tk.IntVar(value=30)  # registrations per hour
        self.start_time_var = tk.StringVar(value="09:00")
        self.end_time_var = tk.StringVar(value="17:00")
        self.max_retries_var = tk.IntVar(value=3)
        self.delay_var = tk.IntVar(value=5)
        
    def setup_main_tab(self):
        # File Selection Section
        self.file_frame = ttk.LabelFrame(self.main_tab, 
                                       text=" Step 1: Select CSV File ", 
                                       padding=15)
        self.file_frame.pack(fill=tk.X, pady=10)
        
        self.file_path = tk.StringVar()
        ttk.Entry(self.file_frame, 
                 textvariable=self.file_path, 
                 width=50).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(self.file_frame, 
                  text="Browse CSV", 
                  command=self.browse_file,
                  style='Accent.TButton').pack(side=tk.LEFT)
        
        # Phone Numbers Section
        self.phone_frame = ttk.LabelFrame(self.main_tab, 
                                        text=" Step 2: Phone Numbers ", 
                                        padding=15)
        self.phone_frame.pack(fill=tk.X, pady=10)
        
        phone_input_frame = ttk.Frame(self.phone_frame)
        phone_input_frame.pack(fill=tk.X, pady=5)
        
        self.phone_entry = ttk.Entry(phone_input_frame, width=20)
        self.phone_entry.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(phone_input_frame, 
                  text="Add Phone", 
                  command=self.add_phone_number,
                  style='Accent.TButton').pack(side=tk.LEFT)
        
        # Phone list
        self.phone_listbox = tk.Listbox(self.phone_frame, height=3)
        self.phone_listbox.pack(fill=tk.X, pady=5)
        
        ttk.Button(self.phone_frame, 
                  text="Remove Selected", 
                  command=self.remove_phone_number).pack(side=tk.RIGHT)
        
        # Preview Section
        self.preview_frame = ttk.LabelFrame(self.main_tab, 
                                          text=" Registration Data Preview ", 
                                          padding=15)
        self.preview_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.tree = ttk.Treeview(self.preview_frame, 
                                columns=('Site Name', 'URL', 'Status'), 
                                show='headings',
                                height=10)
        
        self.tree.heading('Site Name', text='Site Name')
        self.tree.heading('URL', text='URL')
        self.tree.heading('Status', text='Status')
        
        self.tree.column('Site Name', width=200)
        self.tree.column('URL', width=300)
        self.tree.column('Status', width=100)
        
        # Add scrollbar to treeview
        scrollbar = ttk.Scrollbar(self.preview_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Progress Section
        self.progress_frame = ttk.Frame(self.main_tab)
        self.progress_frame.pack(fill=tk.X, pady=10)
        
        self.progress_label = ttk.Label(self.progress_frame, 
                                      text="Progress: 0/0")
        self.progress_label.pack(side=tk.LEFT)
        
        self.progress = ttk.Progressbar(self.progress_frame, 
                                      orient=tk.HORIZONTAL, 
                                      length=300, 
                                      mode='determinate')
        self.progress.pack(side=tk.RIGHT, fill=tk.X, expand=True, padx=(10, 0))
        
        # Console Output
        self.console_frame = ttk.LabelFrame(self.main_tab, 
                                          text=" Activity Log ", 
                                          padding=15)
        self.console_frame.pack(fill=tk.BOTH, expand=True)
        
        self.console = scrolledtext.ScrolledText(self.console_frame, 
                                               height=8,
                                               wrap=tk.WORD,
                                               font=('Consolas', 9))
        self.console.pack(fill=tk.BOTH, expand=True)
        
        # Control Buttons
        self.control_frame = ttk.Frame(self.main_tab)
        self.control_frame.pack(fill=tk.X, pady=10)
        
        self.start_btn = ttk.Button(self.control_frame, 
                                  text="Start Registration", 
                                  command=self.start_bot,
                                  style='Accent.TButton')
        self.start_btn.pack(side=tk.LEFT, padx=5)
        
        self.stop_btn = ttk.Button(self.control_frame, 
                                 text="Stop", 
                                 command=self.stop_bot,
                                 state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        
        self.reset_btn = ttk.Button(self.control_frame, 
                                  text="Reset", 
                                  command=self.reset_status)
        self.reset_btn.pack(side=tk.LEFT, padx=5)
        
    def setup_settings_tab(self):
        # Speed Control
        speed_frame = ttk.LabelFrame(self.settings_tab, 
                                   text=" Registration Speed ", 
                                   padding=15)
        speed_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(speed_frame, text="Registrations per hour:").pack(anchor=tk.W)
        speed_scale = ttk.Scale(speed_frame, 
                              from_=10, to=100, 
                              variable=self.speed_var,
                              orient=tk.HORIZONTAL)
        speed_scale.pack(fill=tk.X, pady=5)
        
        self.speed_label = ttk.Label(speed_frame, text="30 registrations/hour")
        self.speed_label.pack(anchor=tk.W)
        
        def update_speed_label(val):
            speed = int(float(val))
            delay = 3600 / speed
            self.speed_label.config(text=f"{speed} registrations/hour (delay: {delay:.1f}s)")
        
        speed_scale.config(command=update_speed_label)
        
        # Schedule Control
        schedule_frame = ttk.LabelFrame(self.settings_tab, 
                                      text=" Operating Schedule ", 
                                      padding=15)
        schedule_frame.pack(fill=tk.X, pady=10)
        
        time_frame = ttk.Frame(schedule_frame)
        time_frame.pack(fill=tk.X)
        
        ttk.Label(time_frame, text="Start Time:").pack(side=tk.LEFT)
        start_time_entry = ttk.Entry(time_frame, textvariable=self.start_time_var, width=10)
        start_time_entry.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(time_frame, text="End Time:").pack(side=tk.LEFT, padx=(20, 0))
        end_time_entry = ttk.Entry(time_frame, textvariable=self.end_time_var, width=10)
        end_time_entry.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(schedule_frame, text="Format: HH:MM (24-hour)").pack(anchor=tk.W, pady=5)
        
        # Retry Settings
        retry_frame = ttk.LabelFrame(self.settings_tab, 
                                   text=" Retry Settings ", 
                                   padding=15)
        retry_frame.pack(fill=tk.X, pady=10)
        
        retry_controls = ttk.Frame(retry_frame)
        retry_controls.pack(fill=tk.X)
        
        ttk.Label(retry_controls, text="Max Retries:").pack(side=tk.LEFT)
        ttk.Spinbox(retry_controls, from_=1, to=10, 
                   textvariable=self.max_retries_var, width=5).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(retry_controls, text="Delay (seconds):").pack(side=tk.LEFT, padx=(20, 0))
        ttk.Spinbox(retry_controls, from_=1, to=30, 
                   textvariable=self.delay_var, width=5).pack(side=tk.LEFT, padx=5)
        
    def configure_styles(self):
        self.style.configure('TFrame', background='#ecf0f1')
        self.style.configure('TLabel', background='#ecf0f1', font=('Helvetica', 10))
        self.style.configure('TButton', font=('Helvetica', 10))
        self.style.configure('Accent.TButton', foreground='white', background='#3498db')
        self.style.map('Accent.TButton', 
                      background=[('active', '#2980b9'), ('pressed', '#2c3e50')])
        self.style.configure('Treeview', font=('Helvetica', 9), rowheight=25)
        self.style.configure('Treeview.Heading', font=('Helvetica', 10, 'bold'))
        
    def add_phone_number(self):
        phone = self.phone_entry.get().strip()
        if phone and phone not in self.phone_numbers:
            self.phone_numbers.append(phone)
            self.phone_listbox.insert(tk.END, phone)
            self.phone_entry.delete(0, tk.END)
            self.log_message(f"Added phone number: {phone}")
        
    def remove_phone_number(self):
        selection = self.phone_listbox.curselection()
        if selection:
            index = selection[0]
            phone = self.phone_numbers.pop(index)
            self.phone_listbox.delete(index)
            self.log_message(f"Removed phone number: {phone}")
        
    def browse_file(self):
        file_path = filedialog.askopenfilename(
            title="Select CSV File",
            filetypes=[("CSV Files", "*.csv"), ("All Files", "*.*")]
        )
        if file_path:
            self.file_path.set(file_path)
            self.load_preview(file_path)
            
    def load_preview(self, file_path):
        try:
            df = pd.read_csv(file_path)
            
            # Check for required columns
            required_columns = ['site name', 'url']
            df.columns = df.columns.str.lower().str.strip()
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                messagebox.showerror("Error", f"CSV file missing required columns: {', '.join(missing_columns)}")
                return
                
            self.registrations = df.to_dict('records')
            
            # Clear existing data
            for i in self.tree.get_children():
                self.tree.delete(i)
                
            # Add new data
            for i, row in enumerate(self.registrations):
                self.tree.insert('', 'end', 
                                values=(row['site name'], 
                                       row['url'], 
                                       "Pending"))
            
            self.progress['maximum'] = len(self.registrations)
            self.progress['value'] = 0
            self.progress_label.config(text=f"Progress: 0/{len(self.registrations)}")
            self.log_message(f"Loaded {len(self.registrations)} sites from: {file_path}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load CSV file:\n{str(e)}")
    
    def log_message(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.console.insert(tk.END, f"[{timestamp}] {message}\n")
        self.console.see(tk.END)
        self.root.update()
    
    def is_within_operating_hours(self):
        try:
            current_time = datetime.now().time()
            start_time = dt_time(*map(int, self.start_time_var.get().split(':')))
            end_time = dt_time(*map(int, self.end_time_var.get().split(':')))
            
            if start_time <= end_time:
                return start_time <= current_time <= end_time
            else:  # Overnight schedule
                return current_time >= start_time or current_time <= end_time
        except:
            return True  # If time parsing fails, assume always active
    
    def start_bot(self):
        if not self.registrations:
            messagebox.showwarning("Warning", "No registration data loaded!")
            return
            
        if not self.phone_numbers:
            messagebox.showwarning("Warning", "Please add at least one phone number!")
            return
            
        self.bot_running = True
        self.status_var.set("🟡 Running...")
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        
        # Run bot in separate thread
        threading.Thread(target=self.run_bot, daemon=True).start()
    
    def stop_bot(self):
        self.bot_running = False
        self.status_var.set("🔴 Stopping...")
        if self.driver:
            try:
                self.driver.quit()
                self.driver = None
            except:
                pass
    
    def reset_status(self):
        # Reset all statuses to pending
        for item in self.tree.get_children():
            values = list(self.tree.item(item)['values'])
            values[2] = "Pending"  # Status column
            self.tree.item(item, values=values)
        
        self.progress['value'] = 0
        self.progress_label.config(text=f"Progress: 0/{len(self.registrations)}")
        self.log_message("Status reset - all sites set to pending")
    
    def run_bot(self):
        try:
            self.initialize_driver()
            
            # Calculate delay between registrations based on speed
            delay_between_registrations = 3600 / self.speed_var.get()
            
            completed = 0
            for i, site_data in enumerate(self.registrations, 1):
                if not self.bot_running:
                    break
                
                # Check operating hours
                if not self.is_within_operating_hours():
                    self.log_message("Outside operating hours - waiting...")
                    while not self.is_within_operating_hours() and self.bot_running:
                        time.sleep(60)  # Check every minute
                    if not self.bot_running:
                        break
                
                self.update_progress(i, site_data)
                
                # Process registration with retries
                success = False
                for attempt in range(self.max_retries_var.get()):
                    if not self.bot_running:
                        break
                        
                    if attempt > 0:
                        self.log_message(f"Retry attempt {attempt + 1}/{self.max_retries_var.get()}")
                        time.sleep(self.delay_var.get())
                    
                    success = self.process_registration(site_data, i)
                    if success:
                        break
                
                if success:
                    completed += 1
                    self.update_site_status(site_data, "✅ Success")
                else:
                    self.update_site_status(site_data, "❌ Failed")
                
                # Wait before next registration
                if i < len(self.registrations) and self.bot_running:
                    self.log_message(f"Waiting {delay_between_registrations:.1f}s before next registration...")
                    time.sleep(delay_between_registrations)
            
            self.log_message(f"\nProcess completed! {completed}/{len(self.registrations)} successful registrations")
            self.status_var.set("🟢 Completed")
            
        except Exception as e:
            self.log_message(f"\nERROR: {str(e)}")
            self.status_var.set("🔴 Error")
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                    self.driver = None
                except:
                    pass
            self.start_btn.config(state=tk.NORMAL)
            self.stop_btn.config(state=tk.DISABLED)
    
    def update_progress(self, current, site_data):
        self.progress['value'] = current
        self.progress_label.config(text=f"Progress: {current}/{len(self.registrations)}")
        self.update_site_status(site_data, "🔄 Processing...")
        self.root.update()
    
    def update_site_status(self, site_data, status):
        site_name = site_data['site name']
        for item in self.tree.get_children():
            values = list(self.tree.item(item)['values'])
            if values[0] == site_name:
                values[2] = status
                self.tree.item(item, values=values)
                break
        self.root.update()
    
    def initialize_driver(self):
        try:
            options = webdriver.ChromeOptions()
            options.add_argument("--start-maximized")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            options.add_argument("--disable-extensions")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            
            self.log_message("Initializing Chrome browser...")
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            
            # Execute script to hide webdriver property
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            
            self.log_message("Chrome browser initialized successfully")
            
        except Exception as e:
            self.log_message(f"Failed to initialize browser: {str(e)}")
            raise
    
    def get_next_phone_number(self):
        if not self.phone_numbers:
            return None
        
        phone = self.phone_numbers[self.current_phone_index]
        self.current_phone_index = (self.current_phone_index + 1) % len(self.phone_numbers)
        return phone
    
    def process_registration(self, site_data, index):
        url = site_data['url']
        site_name = site_data['site name']
        
        self.log_message(f"\n[{index}/{len(self.registrations)}] Processing: {site_name}")
        self.log_message(f"URL: {url}")
        
        try:
            # Navigate to the site
            self.driver.get(url)
            self.log_message("Page loaded successfully")
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Random delay to appear more human-like
            time.sleep(random.uniform(2, 5))
            
            # Try to find and fill registration form
            if self.find_and_fill_registration_form():
                self.log_message("Registration form filled and submitted successfully")
                
                # Wait for potential redirect or confirmation
                time.sleep(3)
                
                # Check for success indicators
                if self.check_registration_success():
                    return True
                else:
                    self.log_message("Registration may have failed - no success confirmation found")
                    return False
            else:
                self.log_message("Could not find or fill registration form")
                return False
                
        except Exception as e:
            self.log_message(f"Error processing {site_name}: {str(e)}")
            return False
    
    def find_and_fill_registration_form(self):
        try:
            # Get current phone number
            phone_number = self.get_next_phone_number()
            if not phone_number:
                self.log_message("No phone numbers available")
                return False
            
            self.log_message(f"Using phone number: {phone_number}")
            
            # Common registration form field selectors
            field_selectors = {
                'email': [
                    'input[type="email"]',
                    'input[name*="email"]',
                    'input[id*="email"]',
                    'input[placeholder*="email" i]'
                ],
                'phone': [
                    'input[type="tel"]',
                    'input[name*="phone"]',
                    'input[name*="mobile"]',
                    'input[id*="phone"]',
                    'input[id*="mobile"]',
                    'input[placeholder*="phone" i]',
                    'input[placeholder*="mobile" i]'
                ],
                'password': [
                    'input[type="password"]',
                    'input[name*="password"]',
                    'input[id*="password"]'
                ],
                'first_name': [
                    'input[name*="first"]',
                    'input[name*="fname"]',
                    'input[id*="first"]',
                    'input[placeholder*="first" i]'
                ],
                'last_name': [
                    'input[name*="last"]',
                    'input[name*="lname"]',
                    'input[id*="last"]',
                    'input[placeholder*="last" i]'
                ]
            }
            
            filled_fields = 0
            
            # Fill phone number (priority field)
            for selector in field_selectors['phone']:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed() and element.is_enabled():
                        element.clear()
                        element.send_keys(phone_number)
                        self.log_message(f"Filled phone field with: {phone_number}")
                        filled_fields += 1
                        time.sleep(random.uniform(0.5, 1.5))
                        break
                except:
                    continue
            
            # Fill email field if available
            for selector in field_selectors['email']:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed() and element.is_enabled():
                        # Generate a random email
                        email = f"user{random.randint(1000, 9999)}@example.com"
                        element.clear()
                        element.send_keys(email)
                        self.log_message(f"Filled email field with: {email}")
                        filled_fields += 1
                        time.sleep(random.uniform(0.5, 1.5))
                        break
                except:
                    continue
            
            # Fill password field
            for selector in field_selectors['password']:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed() and element.is_enabled():
                        password = f"Password{random.randint(100, 999)}!"
                        element.clear()
                        element.send_keys(password)
                        self.log_message("Filled password field")
                        filled_fields += 1
                        time.sleep(random.uniform(0.5, 1.5))
                        break
                except:
                    continue
            
            # Fill name fields
            for selector in field_selectors['first_name']:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed() and element.is_enabled():
                        first_name = f"User{random.randint(100, 999)}"
                        element.clear()
                        element.send_keys(first_name)
                        self.log_message(f"Filled first name: {first_name}")
                        filled_fields += 1
                        time.sleep(random.uniform(0.5, 1.5))
                        break
                except:
                    continue
            
            for selector in field_selectors['last_name']:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed() and element.is_enabled():
                        last_name = f"Test{random.randint(100, 999)}"
                        element.clear()
                        element.send_keys(last_name)
                        self.log_message(f"Filled last name: {last_name}")
                        filled_fields += 1
                        time.sleep(random.uniform(0.5, 1.5))
                        break
                except:
                    continue
            
            if filled_fields == 0:
                self.log_message("No form fields found to fill")
                return False
            
            self.log_message(f"Filled {filled_fields} form fields")
            
            # Try to submit the form
            return self.submit_registration_form()
            
        except Exception as e:
            self.log_message(f"Error filling registration form: {str(e)}")
            return False
    
    def submit_registration_form(self):
        try:
            # Common submit button selectors
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Register")',
                'button:contains("Sign Up")',
                'button:contains("Create Account")',
                'button:contains("Join")',
                'button:contains("Submit")',
                '.btn-submit',
                '.submit-btn',
                '#submit',
                '.register-btn'
            ]
            
            for selector in submit_selectors:
                try:
                    if ':contains(' in selector:
                        # Use XPath for text-based selectors
                        xpath_selector = f"//button[contains(text(), '{selector.split('\"')[1]}')]"
                        element = self.driver.find_element(By.XPATH, xpath_selector)
                    else:
                        element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if element.is_displayed() and element.is_enabled():
                        # Scroll to element
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
                        time.sleep(1)
                        
                        # Click the submit button
                        element.click()
                        self.log_message("Clicked submit button")
                        return True
                        
                except:
                    continue
            
            # If no submit button found, try pressing Enter on the last filled field
            try:
                active_element = self.driver.switch_to.active_element
                active_element.send_keys(Keys.RETURN)
                self.log_message("Pressed Enter to submit form")
                return True
            except:
                pass
            
            self.log_message("Could not find submit button or submit form")
            return False
            
        except Exception as e:
            self.log_message(f"Error submitting form: {str(e)}")
            return False
    
    def check_registration_success(self):
        try:
            # Wait a bit for page to load after submission
            time.sleep(3)
            
            # Common success indicators
            success_indicators = [
                "success",
                "welcome",
                "thank you",
                "confirmation",
                "registered",
                "account created",
                "verify",
                "check your email",
                "check your phone"
            ]
            
            page_text = self.driver.page_source.lower()
            
            for indicator in success_indicators:
                if indicator in page_text:
                    self.log_message(f"Success indicator found: {indicator}")
                    return True
            
            # Check URL for success patterns
            current_url = self.driver.current_url.lower()
            url_success_patterns = ["success", "welcome", "confirm", "verify", "thank"]
            
            for pattern in url_success_patterns:
                if pattern in current_url:
                    self.log_message(f"Success pattern in URL: {pattern}")
                    return True
            
            return False
            
        except Exception as e:
            self.log_message(f"Error checking registration success: {str(e)}")
            return False

if __name__ == "__main__":
    root = tk.Tk()
    app = RegistrationBotUI(root)
    root.mainloop()