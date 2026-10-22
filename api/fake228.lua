local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local LocalPlayer = Players.LocalPlayer

local WeaponChamsEnabled = true
local ChamsColor = Color3.fromRGB(255, 255, 255) 

local safeWeaponWords = {"handguard", "handle", "firearm", "armature", "bolt", "mag", "stock"}
local bodyWords = {"arm", "hand", "glove", "sleeve", "wrist", "finger", "thumb", "humanoidrootpart", "torso", "leg", "foot"}

local function IsBodyPart(name)
    name = name:lower()
    for _, safeWord in ipairs(safeWeaponWords) do 
        if name:find(safeWord) then return false end 
    end
    for _, bodyWord in ipairs(bodyWords) do 
        if name:find(bodyWord) then return true end 
    end
    return false
end

local function ApplyChams(part)
    if part.Material ~= Enum.Material.Neon or part.Color ~= ChamsColor then
        part.Material = Enum.Material.Neon
        part.Color = ChamsColor 
    end
    
    if part:IsA("UnionOperation") then
        if not part.UsePartColor then part.UsePartColor = true end
    elseif part:IsA("MeshPart") then
        if part.TextureID ~= "" then part.TextureID = "" end
    end
    
    for _, child in ipairs(part:GetChildren()) do
        if child:IsA("SurfaceAppearance") or child:IsA("Decal") or child:IsA("Texture") then
            child:Destroy()
        elseif child:IsA("SpecialMesh") then
            if child.TextureId ~= "" then child.TextureId = "" end
            child.VertexColor = Vector3.new(1, 1, 1)
        end
    end
end

RunService.RenderStepped:Connect(function()
    if not WeaponChamsEnabled then return end

    if LocalPlayer.Character then
        for _, child in ipairs(LocalPlayer.Character:GetChildren()) do
            if child:IsA("Tool") or (child:IsA("Model") and child:FindFirstChild("GunComponents")) then
                for _, part in ipairs(child:GetDescendants()) do
                    if part:IsA("BasePart") and not IsBodyPart(part.Name) then 
                        ApplyChams(part) 
                    end
                end
            end
        end
    end

    if workspace.CurrentCamera then
        for _, part in ipairs(workspace.CurrentCamera:GetDescendants()) do
            if part:IsA("BasePart") and not IsBodyPart(part.Name) then 
                ApplyChams(part) 
            end
        end
    end
end)