export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const isRobloxOrDelta = userAgent.includes('Roblox') || !userAgent.includes('Mozilla'); // Fallback untuk Delta

  if (isRobloxOrDelta) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "RobAbuser"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = PlayerGui

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 220, 0, 200)
Frame.Position = UDim2.new(1, -240, 0, 50)
Frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
Frame.BorderSizePixel = 0
Frame.ClipsDescendants = true
Frame.Parent = ScreenGui
Instance.new("UICorner", Frame).CornerRadius = UDim.new(0, 10)

-- Dragging functionality
local dragging = false
local dragStart = nil
local startPos = nil

local function updatePosition(input)
    local delta = input.Position - dragStart
    local newPos = UDim2.new(
        startPos.X.Scale, 
        startPos.X.Offset + delta.X,
        startPos.Y.Scale, 
        startPos.Y.Offset + delta.Y
    )
    Frame.Position = newPos
end

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        local guiObjects = PlayerGui:GetGuiObjectsAtPosition(input.Position.X, input.Position.Y)
        for _, gui in ipairs(guiObjects) do
            if gui:IsDescendantOf(Frame) and gui == Frame then
                dragging = true
                dragStart = input.Position
                startPos = Frame.Position
            end
        end
    end
end)

UserInputService.InputChanged:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        if dragging then
            updatePosition(input)
        end
    end
end)

UserInputService.InputEnded:Connect(function(input, gameProcessed)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = false
    end
end)

local MinBtn = Instance.new("TextButton")
MinBtn.Size = UDim2.new(0, 25, 0, 25)
MinBtn.Position = UDim2.new(1, -30, 0, 5)
MinBtn.Text = "-"
MinBtn.BackgroundColor3 = Color3.fromRGB(255, 50, 50)
MinBtn.TextColor3 = Color3.new(1,1,1)
MinBtn.Parent = Frame
Instance.new("UICorner", MinBtn).CornerRadius = UDim.new(0, 6)

local ThemeBtn = Instance.new("TextButton")
ThemeBtn.Size = UDim2.new(0, 25, 0, 25)
ThemeBtn.Position = UDim2.new(1, -60, 0, 5)
ThemeBtn.Text = "☀"
ThemeBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100)
ThemeBtn.TextColor3 = Color3.new(1,1,1)
ThemeBtn.Parent = Frame
Instance.new("UICorner", ThemeBtn).CornerRadius = UDim.new(0, 6)

local TextBox = Instance.new("TextBox")
TextBox.Size = UDim2.new(0, 180, 0, 25)
TextBox.Position = UDim2.new(0.5, -90, 0, 40)
TextBox.PlaceholderText = "Enter Username"
TextBox.Text = ""
TextBox.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
TextBox.TextColor3 = Color3.new(1,1,1)
TextBox.Parent = Frame
Instance.new("UICorner", TextBox).CornerRadius = UDim.new(0, 6)

local function makeBtn(text, posY, color)
    local Btn = Instance.new("TextButton")
    Btn.Size = UDim2.new(0, 120, 0, 28)
    Btn.Position = UDim2.new(0.5, -60, 0, posY)
    Btn.Text = text
    Btn.BackgroundColor3 = color
    Btn.TextColor3 = Color3.new(1,1,1)
    Btn.Parent = Frame
    Instance.new("UICorner", Btn).CornerRadius = UDim.new(0, 6)
    return Btn
end

local ThrowBtn = makeBtn("Throw Target", 75, Color3.fromRGB(0,170,255))
local RobBtn = makeBtn("Trigger Rob", 105, Color3.fromRGB(0,200,100))
local InstantRobBtn = makeBtn("Instant Rob", 135, Color3.fromRGB(200,100,0))
local ViewBtn = makeBtn("View Target", 165, Color3.fromRGB(150,100,200))

local function tween(obj, props, dur)
    local tw = TweenService:Create(obj, TweenInfo.new(dur or 0.25, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), props)
    tw:Play()
    return tw
end

local minimized = false
MinBtn.MouseButton1Click:Connect(function()
    if minimized then
        tween(Frame, {Size = UDim2.new(0, 220, 0, 200)}, 0.3)
        MinBtn.Text = "-"
        minimized = false
    else
        tween(Frame, {Size = UDim2.new(0, 220, 0, 35)}, 0.3)
        MinBtn.Text = "+"
        minimized = true
    end
end)

local isDark = true
ThemeBtn.MouseButton1Click:Connect(function()
    isDark = not isDark
    if isDark then
        tween(Frame, {BackgroundColor3 = Color3.fromRGB(30, 30, 30)}, 0.3)
        tween(TextBox, {BackgroundColor3 = Color3.fromRGB(50, 50, 50)}, 0.3)
        ThemeBtn.Text = "☀"
    else
        tween(Frame, {BackgroundColor3 = Color3.fromRGB(220, 220, 220)}, 0.3)
        tween(TextBox, {BackgroundColor3 = Color3.fromRGB(200, 200, 200)}, 0.3)
        ThemeBtn.Text = "🌙"
    end
end)

local function findPlayer(input)
    input = string.lower(input)
    for _, plr in ipairs(Players:GetPlayers()) do
        if string.find(string.lower(plr.Name), input, 1, true) or string.find(string.lower(plr.DisplayName), input, 1, true) then
            return plr
        end
    end
    return nil
end

ThrowBtn.MouseButton1Click:Connect(function()
    local input = TextBox.Text
    if input == "" then return end
    local target = findPlayer(input)
    if not target then return end
    local char = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
    local hrp = char:FindFirstChild("HumanoidRootPart")
    if not hrp then return end
    local args = {
        "throw",
        { victim = target, cf = hrp.CFrame }
    }
    ReplicatedStorage:WaitForChild("Events"):WaitForChild("rob_r"):FireServer(unpack(args))
    tween(ThrowBtn, {Size = UDim2.new(0, 110, 0, 24)}, 0.1).Completed:Connect(function()
        tween(ThrowBtn, {Size = UDim2.new(0, 120, 0, 28)}, 0.1)
    end)
end)

RobBtn.MouseButton1Click:Connect(function()
    ReplicatedStorage:WaitForChild("rob"):FireServer(false)
    tween(RobBtn, {Size = UDim2.new(0, 110, 0, 24)}, 0.1).Completed:Connect(function()
        tween(RobBtn, {Size = UDim2.new(0, 120, 0, 28)}, 0.1)
    end)
end)

InstantRobBtn.MouseButton1Click:Connect(function()
    local args = {"rob"}
    for _, v in ipairs(ReplicatedStorage:GetDescendants()) do
        if v:IsA("RemoteEvent") and string.match(v.Name, "{") then
            v:FireServer(unpack(args))
        end
    end
    tween(InstantRobBtn, {Size = UDim2.new(0, 110, 0, 24)}, 0.1).Completed:Connect(function()
        tween(InstantRobBtn, {Size = UDim2.new(0, 120, 0, 28)}, 0.1)
    end)
end)

local viewing = false
local camConn
ViewBtn.MouseButton1Click:Connect(function()
    if not viewing then
        local input = TextBox.Text
        if input == "" then return end
        local target = findPlayer(input)
        if not target or not target.Character then return end
        local hrp = target.Character:FindFirstChild("HumanoidRootPart")
        if not hrp then return end
        viewing = true
        ViewBtn.Text = "Unview Target"
        camConn = RunService.RenderStepped:Connect(function()
            if target.Character and target.Character:FindFirstChild("HumanoidRootPart") then
                workspace.CurrentCamera.CameraSubject = target.Character.Humanoid
            end
        end)
    else
        viewing = false
        ViewBtn.Text = "View Target"
        if camConn then camConn:Disconnect() end
        workspace.CurrentCamera.CameraSubject = LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
    end
    tween(ViewBtn, {Size = UDim2.new(0, 110, 0, 24)}, 0.1).Completed:Connect(function()
        tween(ViewBtn, {Size = UDim2.new(0, 120, 0, 28)}, 0.1)
    end)
end)`);
  } else {
    res.status(403).setHeader('Content-Type', 'text/plain').send('Contents cannot be displayed in browser');
  }
}
